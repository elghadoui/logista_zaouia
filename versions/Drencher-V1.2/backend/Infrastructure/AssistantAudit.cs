namespace Vitasouss;
public sealed class AssistantAudit(ILogger<AssistantAudit> logger)
{
    private readonly object gate = new();
    public void Write(string user, int context, string model, string? tool, bool success, string code, long? inputTokens = null, long? outputTokens = null)
    {
        var metadata = new { date = DateTime.UtcNow, user, context, model, tool, success, code, inputTokens, outputTokens };
        var line = Json.Write(metadata);
        logger.LogInformation("Assistant {Audit}", line);
        try
        {
            lock (gate)
            {
                var path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "Vitasouss", "assistant-audit");
                Directory.CreateDirectory(path);
                File.AppendAllText(Path.Combine(path, DateTime.UtcNow.ToString("yyyy-MM-dd") + ".jsonl"), line + Environment.NewLine);
            }
        }
        catch { logger.LogWarning("Assistant : journal fichier indisponible ; métadonnées conservées dans le journal serveur."); }
    }
}
