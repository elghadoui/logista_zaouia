using Dapper;
using System.Security.Claims;
namespace Vitasouss;
public interface IAssistantProvider { bool Configured { get; } Task<object> Answer(string question, Func<string, int?, Task<object>> readTool, CancellationToken cancellation); }
public sealed class UnconfiguredAssistantProvider : IAssistantProvider
{
    public bool Configured => false;
    public Task<object> Answer(string question, Func<string, int?, Task<object>> readTool, CancellationToken cancellation) => throw new RuleException("Assistant IA non configuré. Les outils de lecture restent disponibles.", 409);
}
public sealed class AssistantService(Connections connections, PresentationService presentation, PilotService pilot, IAssistantProvider provider)
{
    public object Status() => new { configured = provider.Configured, message = provider.Configured ? "Assistant en lecture seule" : "Assistant IA non configuré", tools = new[] { "adherent", "parcelles-adherent", "receptions", "versements", "ecarts" }, sqlGeneration = false, mutations = false };
    public async Task<object> Tool(ContextInfo context, string name, int? refadh)
    {
        if (name == "adherent")
        {
            if (refadh is null) throw new RuleException("Référence adhérent obligatoire.");
            return await presentation.Details(context, "adherent", Json.Read("{\"refadh\":" + refadh + "}"));
        }
        if (name == "parcelles-adherent")
        {
            if (refadh is null) throw new RuleException("Référence adhérent obligatoire.");
            await using var db = await connections.Business(context);
            var total = await db.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@refadh", new { refadh });
            var rows = (await db.QueryAsync("SELECT p.* FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@refadh ORDER BY p.idparcelle,p.refpar,p.numcul,p.refver LIMIT 25", new { refadh })).Select(r => ReferentialService.Row((object)r));
            return new { total, rows, limit = 25, message = "Première page ; détail complet dans les référentiels." };
        }
        if (name is "receptions" or "versements" or "ecarts") return await pilot.Board(context, name, null, null, 1, null, null);
        throw new RuleException("Outil de lecture non autorisé.", 403);
    }
    public Task<object> Chat(ContextInfo context, string question, CancellationToken cancellation)
    {
        if (string.IsNullOrWhiteSpace(question) || question.Length > 2000) throw new RuleException("Question entre 1 et 2000 caractères.");
        return provider.Answer(question, (name, id) => Tool(context, name, id), cancellation);
    }
}
public record AssistantQuestion(string Question);

