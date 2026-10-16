using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Dapper;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Vitasouss;

var results = new List<object>();
void Check(string name, bool ok) { if (!ok) throw new Exception(name); results.Add(new { name, passed = true }); Console.WriteLine("PASS " + name); }
async Task Fail(string name, Func<Task> run, string code) {
    try { await run(); throw new Exception("Failure expected: " + name); }
    catch (AssistantFailure e) { Check(name, e.Code == code && e.Message == "Assistant IA indisponible"); }
}
var opts = new AssistantOptions { Model = "test-model", TimeoutSeconds = 1 }; opts.Normalize();
var turns = new[] { new AssistantTurn("user", "Question fictive") };
object calls(params string[] names) => new { status = "completed", output = names.Select((name, i) => new { type = "function_call", name, call_id = "test-call-" + i, arguments = Json.Write(new { refadh = name.Contains("adherent") ? (int?)76 : null, from = (string?)null, to = (string?)null }) }), usage = new { input_tokens = 5, output_tokens = 2 } };
object answer(string text = "Résultat de test") => new { status = "completed", output = new[] { new { type = "message", role = "assistant", content = new[] { new { type = "output_text", text } } } }, usage = new { input_tokens = 9, output_tokens = 3 } };
HttpResponseMessage response(object value, HttpStatusCode status = HttpStatusCode.OK) => new(status) { Content = new StringContent(Json.Write(value), Encoding.UTF8, "application/json") };
OpenAiAssistantProvider Provider(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler, bool configured = true, AssistantOptions? settings = null) => new(new HttpClient(new FakeHandler(handler)), new FakeSecret(configured), settings ?? opts);
Task<object> EmptyTool(AssistantToolCall _, CancellationToken ct) { ct.ThrowIfCancellationRequested(); return Task.FromResult<object>(new { rows = Array.Empty<object>(), total = 0 }); }
var unavailable = Provider((_, _) => throw new Exception("HTTP must not run"), false);
Check("Provider non configuré", !unavailable.Configured);
await Fail("Non configuré sans requête réseau", async () => await unavailable.Answer(turns, "test", EmptyTool, default), "NOT_CONFIGURED");
var invalid = Provider((_, _) => Task.FromResult(response(new { error = FakeSecret.Value }, HttpStatusCode.Unauthorized)));
await Fail("Clé invalide : erreur publique sans corps ni secret", async () => await invalid.Answer(turns, "test", EmptyTool, default), "OPENAI_AUTH");
var timeoutProvider = Provider(async (_, ct) => { await Task.Delay(TimeSpan.FromSeconds(5), ct); return response(answer()); });
await Fail("Timeout OpenAI", async () => await timeoutProvider.Answer(turns, "test", EmptyTool, default), "TIMEOUT");
var deny = Provider((_, _) => Task.FromResult(response(calls("synchroniser"))));
int executed = 0;
Task<object> CountTool(AssistantToolCall _, CancellationToken ct) { ct.ThrowIfCancellationRequested(); executed++; return Task.FromResult<object>(new { total = 1 }); }
await Fail("Outil interdit", async () => await deny.Answer(turns, "test", CountTool, default), "TOOL_FORBIDDEN");
Check("Aucune exécution d'outil interdit", executed == 0);
var sql = Provider((_, _) => Task.FromResult(response(calls("execute_sql"))));
await Fail("SQL arbitraire refusé", async () => await sql.Answer(turns, "test", CountTool, default), "TOOL_FORBIDDEN");
var repeated = Provider((_, _) => Task.FromResult(response(calls("adherent"))));
await Fail("Limitation du nombre d'appels", async () => await repeated.Answer(turns, "test", CountTool, default), "TOOL_LIMIT");
Check("Maximum exact d'exécutions", executed == opts.MaxToolCalls);
foreach (var forbidden in new[] { "INSERT", "UPDATE", "DELETE", "ALTER", "DROP", "sync" }) {
    await Fail("Mutation interdite " + forbidden, async () => { await Task.Yield(); OpenAiAssistantProvider.ParseCall(forbidden, "{}"); }, "TOOL_FORBIDDEN");
}
await Fail("Argument SQL injecté refusé", async () => { await Task.Yield(); OpenAiAssistantProvider.ParseCall("adherent", "{\"refadh\":76,\"from\":null,\"to\":null,\"sql\":\"SELECT 1\"}"); }, "TOOL_ARGUMENTS");
await Fail("Argument de contexte non autorisé", async () => { await Task.Yield(); OpenAiAssistantProvider.ParseCall("adherent", "{\"refadh\":76,\"from\":null,\"to\":null,\"contextId\":2}"); }, "TOOL_ARGUMENTS");
await Fail("Date invalide", async () => { await Task.Yield(); OpenAiAssistantProvider.ParseCall("receptions", "{\"refadh\":null,\"from\":\"2026-99-99\",\"to\":null}"); }, "TOOL_ARGUMENTS");
int round = 0;
var functional = Provider(async (req, ct) => {
    var payload = JsonNode.Parse(await req.Content!.ReadAsStringAsync(ct))!;
    Check("Endpoint officiel fixe " + round, req.RequestUri!.ToString() == "https://api.openai.com/v1/responses");
    Check("store false / modèle serveur " + round, payload["store"]!.GetValue<bool>() == false && payload["model"]!.GetValue<string>() == "test-model");
    Check("Clé exclusivement en en-tête " + round, req.Headers.Authorization?.Parameter == FakeSecret.Value && !payload.ToJsonString().Contains(FakeSecret.Value));
    Check("Fonctions strictes seulement " + round, ((JsonArray)payload["tools"]!).Count == 5 && ((JsonArray)payload["tools"]!).All(t => t!["type"]!.GetValue<string>() == "function" && t["strict"]!.GetValue<bool>()));
    if (round++ == 0) return response(calls("adherent"));
    Check("Résultat relié au call_id", payload["input"]!.AsArray().Any(x => x?["type"]?.GetValue<string>() == "function_call_output" && x["call_id"]?.GetValue<string>() == "test-call-0"));
    return response(answer());
});
var result = await functional.Answer(turns, "TEST STATION / TEST EXERCICE", EmptyTool, default);
Check("Tool calling puis réponse avec tokens cumulés", result.Text == "Résultat de test" && result.InputTokens == 14 && result.OutputTokens == 5);
var small = new AssistantOptions { Model = "test-model", MaxContextCharacters = 4000 }; small.Normalize();
var oversized = Provider((_, _) => throw new Exception("HTTP must not run"), settings: small);
await Fail("Limite contexte avant envoi", async () => await oversized.Answer([new("user", new string('x', 5000))], "test", EmptyTool, default), "CONTEXT_LIMIT");
var cache = new AssistantConversations(); var (cid, _) = cache.Get(null, "1", 19);
try { cache.Get(cid, "2", 19); throw new Exception("expected"); } catch (RuleException e) { Check("Conversation isolée par utilisateur", e.Status == 403); }
try { cache.Get(cid, "1", 20); throw new Exception("expected"); } catch (RuleException e) { Check("Conversation isolée par exercice", e.Status == 403); }
cache.Remove(cid, "1", 19);
try { cache.Get(cid, "1", 19); throw new Exception("expected"); } catch (RuleException e) { Check("Nouvelle conversation efface le précédent historique", e.Status == 403); }
var toolTimeout = Provider((_, _) => Task.FromResult(response(calls("adherent"))));
await Fail("Timeout englobe l'outil", async () => await toolTimeout.Answer(turns, "test", async (_, ct) => { await Task.Delay(5000, ct); return new { total = 0 }; }, default), "TIMEOUT");

// Integration is opt-in and restricted to the already isolated local test database.
if (args.Contains("--local-integration")) {
    if (!OperatingSystem.IsWindows()) throw new Exception("Windows DPAPI test required");
    var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../"));
    var config = new ConfigurationBuilder().AddJsonFile(Path.Combine(root, "backend/appsettings.Local.json")).Build();
    if (config["Admin:Host"] != "127.0.0.1" || config["Admin:Port"] != "33307" || config["Admin:Database"] != "referentiels_admin") throw new Exception("Local test database required");
    var services = new ServiceCollection();
    services.AddDataProtection().SetApplicationName("Vitasouss.Referentiels.V1").PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(root, "backend/keys"))).ProtectKeysWithDpapi();
    using var serviceProvider = services.BuildServiceProvider();
    using var connections = new Connections(config, serviceProvider.GetRequiredService<IDataProtectionProvider>());
    await using var admin = await connections.Admin();
    var context = await admin.QuerySingleAsync<ContextInfo>("SELECT c.id Id,s.code Station,c.label Label,c.database_name DatabaseName,c.read_only ReadOnly,s.is_master IsMaster,c.local_refsta LocalRefsta,s.server_id ServerId FROM app_contexts c JOIN app_stations s ON s.id=c.station_id WHERE c.enabled=1 AND c.database_name LIKE 'vitasouss_test_v13_src_%' ORDER BY c.id DESC LIMIT 1");
    if (!context.DatabaseName.StartsWith("vitasouss_test_v13_src_")) throw new Exception("Fixture required");
    var target = await admin.QuerySingleAsync<ContextInfo>("SELECT c.id Id,s.code Station,c.label Label,c.database_name DatabaseName,c.read_only ReadOnly,s.is_master IsMaster,c.local_refsta LocalRefsta,s.server_id ServerId FROM app_contexts c JOIN app_stations s ON s.id=c.station_id WHERE c.enabled=1 AND c.database_name LIKE 'vitasouss_test_v13_dst_%' ORDER BY c.id DESC LIMIT 1");
    foreach (var ctx in new[] { context, target }) {
        var server = await admin.QuerySingleAsync("SELECT host,port FROM app_servers WHERE id=@id", new { id = ctx.ServerId });
        if ((string)server.host != "127.0.0.1" || (int)server.port != 33307) throw new Exception("Local business test server required");
    }
    async Task<string> Fingerprint(ContextInfo ctx) {
        await using var db = await connections.Business(ctx);
        var rows = new List<object>();
        foreach (var table in new[] { "adherent", "verger", "parcelle", "reception", "reception_d", "versement", "ecart_e" }) {
            rows.Add(new { table, count = await db.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM `" + table + "`"), checksum = await db.QuerySingleAsync("CHECKSUM TABLE `" + table + "`") });
        }
        return Json.Write(rows);
    }
    var sourceBefore = await Fingerprint(context); var targetBefore = await Fingerprint(target);
    var uid = await admin.ExecuteScalarAsync<long>("INSERT INTO app_users(username,display_name,password_hash,role,enabled) VALUES(@name,'TEST IA','NO LOGIN','Consultation',1); SELECT LAST_INSERT_ID()", new { name = "test_ai_" + Guid.NewGuid().ToString("N") });
    try {
        await admin.ExecuteAsync("INSERT INTO app_user_contexts(user_id,context_id) VALUES(@uid,@id)", new { uid, id = context.Id });
        var version = await admin.ExecuteScalarAsync<int>("SELECT auth_version FROM app_users WHERE id=@uid", new { uid });
        var actor = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim(ClaimTypes.NameIdentifier, uid.ToString()), new Claim(ClaimTypes.Role, "Consultation"), new Claim("version", version.ToString()) }, "test"));
        var resolved = await connections.Resolve(context.Id, actor);
        var pilot = new PilotService(connections, new PilotCatalog(), new ReferentialService(connections, new Catalog()));
        int step = 0;
        var realToolsProvider = Provider((_, _) => Task.FromResult(response(step++ == 0 ? calls("adherent") : answer("Synthèse fictive validée"))));
        var settings = new AssistantOptions { Model = "test-model", MaxRowsPerTool = 3 }; settings.Normalize();
        var service = new AssistantService(connections, pilot, realToolsProvider, settings, new AssistantConversations(), new AssistantAudit(NullLogger<AssistantAudit>.Instance));
        var realReply = JsonSerializer.SerializeToElement(await service.Chat(resolved, new("Combien de vergers pour l'adhérent 76 ?"), actor, default), Json.Options);
        Check("Consultation : tool calling avec vrais outils locaux", realReply.GetProperty("available").GetBoolean() && step == 2);
        var profile = JsonSerializer.SerializeToElement(await service.Tool(resolved, "adherent", 76), Json.Options);
        Check("Adhérent : champs personnels minimisés", profile.GetProperty("record").EnumerateObject().Count() == 2 && profile.GetProperty("metrics").GetProperty("vergers").GetInt64() > 0);
        var parcels = JsonSerializer.SerializeToElement(await service.Tool(resolved, "parcelles-adherent", 76), Json.Options);
        Check("Limite lignes outil réellement appliquée", parcels.GetProperty("rows").GetArrayLength() <= 3 && parcels.GetProperty("total").GetInt64() >= 12);
        foreach (var name in new[] { "receptions", "versements", "ecarts" }) {
            var board = JsonSerializer.SerializeToElement(await service.Tool(resolved, name, null, "2026-10-01", "2026-10-01"), Json.Options);
            Check("Période outil " + name, board.GetProperty("available").GetBoolean() && board.GetProperty("rows").GetArrayLength() <= 3);
        }
        try { await connections.Resolve(target.Id, actor); throw new Exception("expected"); } catch (RuleException e) { Check("Exercice non autorisé refusé", e.Status == 403); }
        try { await service.Tool(resolved, "execute_sql", null); throw new Exception("expected"); } catch (RuleException e) { Check("SQL arbitraire refusé dans dispatcher", e.Status == 403); }
        var disabledService = new AssistantService(connections, pilot, unavailable, opts, new AssistantConversations(), new AssistantAudit(NullLogger<AssistantAudit>.Instance));
        var disabledReply = JsonSerializer.SerializeToElement(await disabledService.Chat(resolved, new("test"), actor, default), Json.Options);
        Check("Consultation : diagnostic technique masqué", !disabledReply.GetProperty("available").GetBoolean() && disabledReply.GetProperty("diagnostic").ValueKind == JsonValueKind.Null);
        try { await service.Chat(resolved, new(new string('x', 9000)), actor, default); throw new Exception("expected"); } catch (RuleException e) { Check("Question trop longue refusée", e.Status == 400); }
        await admin.ExecuteAsync("UPDATE app_users SET enabled=0 WHERE id=@uid", new { uid });
        step = 0;
        var revoked = JsonSerializer.SerializeToElement(await service.Chat(resolved, new("test"), actor, default), Json.Options);
        Check("Compte révoqué : aucun outil exécuté", !revoked.GetProperty("available").GetBoolean() && step == 1);
        Check("Aucune mutation ZAOUIA", await Fingerprint(context) == sourceBefore);
        Check("Aucune mutation DIAF", await Fingerprint(target) == targetBefore);
    } finally { await admin.ExecuteAsync("DELETE FROM app_user_contexts WHERE user_id=@uid; DELETE FROM app_users WHERE id=@uid", new { uid }); }
}
var reportPath = Path.GetFullPath(args.FirstOrDefault(a => a.EndsWith(".json")) ?? "docs/assistant-verification.json");
File.WriteAllText(reportPath, Json.Write(new { testedAt = DateTime.UtcNow, realOpenAiCalls = 0, results }));
Console.WriteLine(results.Count + " vérifications assistant réussies.");

sealed class FakeSecret(bool available) : IOpenAiSecretStore {
    public const string Value = "FAKE-CREDENTIAL-ONLY-NOT-AN-API-KEY";
    public bool Available => available;
    public string Read() => available ? Value : throw new AssistantFailure("NOT_CONFIGURED");
}
sealed class FakeHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> handler) : HttpMessageHandler {
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => handler(request, cancellationToken);
}
