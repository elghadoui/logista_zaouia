using Microsoft.AspNetCore.DataProtection;
using System.Security.Principal;
using System.Text;
namespace Vitasouss;
public interface IOpenAiSecretStore { bool Available { get; } string Read(); }
public sealed class OpenAiSecretStore(IDataProtectionProvider protection) : IOpenAiSecretStore
{
    public static string DirectoryPath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "Vitasouss", "secrets");
    public static string FilePath => Path.Combine(DirectoryPath, "openai.protected");
    private readonly IDataProtector protector = protection.CreateProtector("Vitasouss.OpenAiSecrets.v1");
    public bool Available { get { try { return !string.IsNullOrWhiteSpace(Read()); } catch { return false; } } }
    public string Read()
    {
        try { return protector.Unprotect(File.ReadAllText(FilePath)); }
        catch { throw new AssistantFailure("SECRET_UNAVAILABLE"); }
    }
    public void ProtectInteractive()
    {
        if (!OperatingSystem.IsWindows() || !WindowsIdentity.GetCurrent().Name.EndsWith("\\svc_vitasouss", StringComparison.OrdinalIgnoreCase))
            throw new AssistantFailure("IDENTITY_MUST_BE_SVC_VITASOUSS");
        if (Console.IsInputRedirected) throw new AssistantFailure("INTERACTIVE_CONSOLE_REQUIRED");
        if (!Directory.Exists(DirectoryPath)) throw new AssistantFailure("SECRET_DIRECTORY_REQUIRED");
        Console.Write("Clé API OpenAI (saisie masquée, Entrée pour valider) : ");
        var value = new StringBuilder();
        while (true)
        {
            var key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter) break;
            if (key.Key == ConsoleKey.Escape) { value.Clear(); throw new AssistantFailure("CANCELLED"); }
            if (key.Key == ConsoleKey.Backspace) { if (value.Length > 0) value.Length--; continue; }
            if (!char.IsControl(key.KeyChar) && value.Length < 1024) value.Append(key.KeyChar);
        }
        Console.WriteLine();
        if (value.Length < 10) { value.Clear(); throw new AssistantFailure("SECRET_INVALID"); }
        var ciphertext = protector.Protect(value.ToString().Trim()); value.Clear();
        // Same-directory atomic replacement, inherited ACL from the secured external directory.
        var temp = Path.Combine(DirectoryPath, Guid.NewGuid().ToString("N") + ".protected");
        try { File.WriteAllText(temp, ciphertext); File.Move(temp, FilePath, overwrite: true); }
        finally { if (File.Exists(temp)) File.Delete(temp); }
        Console.WriteLine("Clé protégée enregistrée : " + FilePath);
    }
}
