using Dapper;
using System.Security.Claims;
using System.Text.Json;
namespace Vitasouss;
public sealed class AssistantService(Connections connections, PilotService pilot, IAssistantProvider provider,
    AssistantOptions options, AssistantConversations conversations, AssistantAudit audit)
{
    public object Status() => new { configured = provider.Configured, message = provider.Configured ? "Assistant en lecture seule" : "Assistant IA indisponible",
        tools = OpenAiAssistantProvider.Tools, sqlGeneration = false, mutations = false, maxQuestionCharacters = options.MaxQuestionCharacters };
    // No SQL, table names, mutations or other context can be supplied to this dispatcher.
    public async Task<object> Tool(ContextInfo context, string name, int? refadh, string? from = null, string? to = null, CancellationToken cancellation = default)
    {
        AssistantToolCall call;
        try { call = OpenAiAssistantProvider.ParseCall(name, Json.Write(new { refadh, from, to })); }
        catch (AssistantFailure) { throw new RuleException("Outil ou paramètres de lecture non autorisés.", 403); }
        var limit = options.MaxRowsPerTool;
        if (call.Name == "adherent")
        {
            await using var db = await connections.Business(context);
            var person = await db.QuerySingleOrDefaultAsync(new CommandDefinition("SELECT refadh,nomadh FROM adherent WHERE refadh=@refadh", new { refadh }, cancellationToken: cancellation));
            if (person is null) throw new RuleException("Adhérent introuvable dans cet exercice.", 404);
            var vergers = await db.ExecuteScalarAsync<long>(new CommandDefinition("SELECT COUNT(*) FROM verger WHERE refadh=@refadh", new { refadh }, cancellationToken: cancellation));
            var parcelles = await db.ExecuteScalarAsync<long>(new CommandDefinition("SELECT COUNT(*) FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@refadh", new { refadh }, cancellationToken: cancellation));
            return new { record = ReferentialService.Row((object)person), metrics = new { vergers, parcelles } };
        }
        if (call.Name == "parcelles-adherent")
        {
            await using var db = await connections.Business(context);
            var total = await db.ExecuteScalarAsync<long>(new CommandDefinition("SELECT COUNT(*) FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@refadh", new { refadh }, cancellationToken: cancellation));
            var rows = (await db.QueryAsync(new CommandDefinition("SELECT p.idparcelle,p.refpar,p.numcul,p.refver FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@refadh ORDER BY p.idparcelle,p.refpar,p.numcul,p.refver LIMIT @limit", new { refadh, limit }, cancellationToken: cancellation))).Select(r => ReferentialService.Row((object)r)).ToArray();
            return new { total, rows, limit, message = "Échantillon limité ; détail complet dans les référentiels." };
        }
        var board = JsonSerializer.SerializeToElement(await pilot.Board(context, call.Name, null, null, 1, call.From, call.To).WaitAsync(cancellation), Json.Options);
        string[] allowed = ["numrec", "dterec", "refadh", "refver", "refpar", "numcul", "refsta", "numver", "datver", "numpal", "dtepal", "codtype", "codvar", "codsvar"];
        var projected = board.GetProperty("rows").EnumerateArray().Take(limit).Select(row => row.EnumerateObject().Where(p => allowed.Contains(p.Name)).ToDictionary(p => p.Name, p => p.Value.Clone())).ToArray();
        return new { available = board.GetProperty("available").GetBoolean(), total = board.GetProperty("total").Clone(), rows = projected, limit, from, to,
            message = "Compteur de lignes de la table principale. Échantillon limité ; unités et tonnages non interprétés." };
    }
    public async Task<object> Chat(ContextInfo context, AssistantQuestion request, ClaimsPrincipal user, CancellationToken cancellation)
    {
        if (string.IsNullOrWhiteSpace(request.Question) || request.Question.Length > options.MaxQuestionCharacters) throw new RuleException($"Question entre 1 et {options.MaxQuestionCharacters} caractères.");
        var uid = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new RuleException("Connexion obligatoire.", 401);
        if (!provider.Configured) { audit.Write(uid, context.Id, options.Model, null, false, "NOT_CONFIGURED"); return new { available = false, message = "Assistant IA indisponible", diagnostic = user.IsInRole("Admin") ? "NOT_CONFIGURED" : null }; }
        var (id, session) = conversations.Get(request.ConversationId, uid, context.Id);
        if (!await session.Gate.WaitAsync(0, cancellation)) throw new RuleException("Une réponse est déjà en cours dans cette conversation.", 429);
        if (!await conversations.GenerationSlots.WaitAsync(0, cancellation)) { session.Gate.Release(); throw new RuleException("Assistant occupé. Réessayez dans un instant.", 429); }
        try
        {
            var turns = session.Turns.ToList(); turns.Add(new("user", request.Question));
            while (turns.Count > 1 && turns.Sum(t => t.Text.Length) > options.MaxContextCharacters / 2) turns.RemoveAt(0);
            var answer = await provider.Answer(turns, context.Station + " / " + context.Label, async (call, token) =>
            {
                try
                {
                    await using var admin = await connections.Admin();
                    var current = await admin.QuerySingleOrDefaultAsync(new CommandDefinition("SELECT enabled,role,auth_version FROM app_users WHERE id=@uid", new { uid }, cancellationToken: token));
                    if (current is null) throw new AssistantFailure("USER_ACCESS_CHANGED");
                    if (!Convert.ToBoolean(current.enabled) || Convert.ToString(current.role) != user.FindFirstValue(ClaimTypes.Role) || Convert.ToString(current.auth_version) != user.FindFirstValue("version")) throw new AssistantFailure("USER_ACCESS_CHANGED");
                    var permitted = await connections.Resolve(context.Id, user).WaitAsync(token);
                    var result = await Tool(permitted, call.Name, call.Refadh, call.From, call.To, token);
                    audit.Write(uid, context.Id, options.Model, call.Name, true, "OK"); return result;
                }
                catch { audit.Write(uid, context.Id, options.Model, call.Name, false, "TOOL_FAILED"); throw; }
            }, cancellation);
            session.Turns.Clear(); session.Turns.AddRange(turns); session.Turns.Add(new("assistant", answer.Text)); session.LastUsed = DateTime.UtcNow;
            audit.Write(uid, context.Id, options.Model, null, true, "OK", answer.InputTokens, answer.OutputTokens);
            return new { available = true, conversationId = id, text = answer.Text, context = new { context.Id, context.Station, context.Label } };
        }
        catch (AssistantFailure ex)
        {
            audit.Write(uid, context.Id, options.Model, null, false, ex.Code);
            if (request.ConversationId is null) conversations.Remove(id, uid, context.Id);
            return new { available = false, message = "Assistant IA indisponible", diagnostic = user.IsInRole("Admin") ? ex.Code : null };
        }
        finally { conversations.GenerationSlots.Release(); session.Gate.Release(); }
    }
    public void NewConversation(int contextId, string id, ClaimsPrincipal user) => conversations.Remove(id, user.FindFirstValue(ClaimTypes.NameIdentifier)!, contextId);
}
public record AssistantQuestion(string Question, string? ConversationId = null);
