using System.Text.Json;
using System.Text.RegularExpressions;

namespace Vitasouss;

public sealed class RuleException(string message, int status = 400) : Exception(message)
{
    public int Status { get; } = status;
}
public record Column(string Name, string Definition)
{
    public bool Generated => Definition.Contains("AUTO_INCREMENT") || Name == "UpdatedAt";
    public bool Nullable => !Definition.Contains("NOT NULL");
    public bool Numeric => Regex.IsMatch(Definition, "^(smallint|int|decimal|double)");
    public bool Date => Definition.StartsWith("date") || Definition.StartsWith("timestamp");
    public int? MaxLength => Regex.Match(Definition, @"^(?:var)?char\((\d+)\)") is { Success: true } m ? int.Parse(m.Groups[1].Value) : null;
    public object? Parse(JsonElement value)
    {
        if (value.ValueKind == JsonValueKind.Null || value.ValueKind == JsonValueKind.Undefined)
        {
            if (!Nullable && !Generated)
                throw new RuleException($"{Name} est obligatoire.");
            return null;
        }
        var text = value.ValueKind == JsonValueKind.String ? value.GetString()! : value.ToString();
        if (Numeric)
        {
            if (!decimal.TryParse(text, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var number))
                throw new RuleException($"{Name} : nombre invalide.");
            if (Definition.StartsWith("int") || Definition.StartsWith("smallint"))
            {
                var min = Definition.Contains("unsigned") ? 0m : Definition.StartsWith("smallint") ? -32768m : -2147483648m;
                var max = Definition.StartsWith("smallint") ? (Definition.Contains("unsigned") ? 65535m : 32767m) : Definition.Contains("unsigned") ? 4294967295m : 2147483647m;
                if (number != decimal.Truncate(number) || number < min || number > max)
                    throw new RuleException($"{Name} : entier hors limites.");
            }
            var precision = Regex.Match(Definition, @"^decimal\((\d+),(\d+)\)");
            if (precision.Success)
            {
                var p = int.Parse(precision.Groups[1].Value);
                var s = int.Parse(precision.Groups[2].Value);
                if (Math.Abs(number) >= (decimal)Math.Pow(10, p - s) || decimal.Round(number, s) != number)
                    throw new RuleException($"{Name} : précision SQL dépassée.");
            }
            if (Definition.Contains("unsigned") && number < 0)
                throw new RuleException($"{Name} ne peut pas être négatif.");
            return number;
        }
        if (Date)
        {
            if (string.IsNullOrEmpty(text) && Nullable)
                return null;
            if (!DateTime.TryParse(text, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var date))
                throw new RuleException($"{Name} : date invalide.");
            return date;
        }
        if (MaxLength is int limit && text.Length > limit)
            throw new RuleException($"{Name} : maximum {limit} caractères.");
        return text;
    }
}
public record Entity(string Name, string[] Keys, string Label, Column[] Columns, string Ddl)
{
    public Column Column(string name) => Columns.FirstOrDefault(c => c.Name == name) ?? throw new RuleException("Champ non autorisé.");
}
public sealed class Catalog
{
    public Entity[] Entities { get; } = JsonSerializer.Deserialize<Entity[]>(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "schema.json")), Json.Options)!;
    public Entity Get(string name) => Entities.FirstOrDefault(e => e.Name == name) ?? throw new RuleException("Référentiel inconnu.", 404);
}
public static class Json
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);
    public static string Write(object? value) => JsonSerializer.Serialize(value, Options);
    public static Dictionary<string, JsonElement> Read(string value) => JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(value, Options)!;
    public static bool Equal(object? a, object? b)
    {
        if (a is null || b is null)
            return a is null && b is null;
        if (a is DateTime da && b is DateTime db)
            return da == db;
        if (a is not string && b is not string && decimal.TryParse(Convert.ToString(a, System.Globalization.CultureInfo.InvariantCulture), System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var na) && decimal.TryParse(Convert.ToString(b, System.Globalization.CultureInfo.InvariantCulture), System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var nb))
            return na == nb;
        return Write(a) == Write(b);
    }
}
public sealed class ContextInfo
{
    public int Id
    {
        get; set;
    }
    public string Station { get; set; } = "";
    public string Label { get; set; } = "";
    public string DatabaseName { get; set; } = "";
    public bool ReadOnly
    {
        get; set;
    }
    public bool IsMaster
    {
        get; set;
    }
    public int? LocalRefsta
    {
        get; set;
    }
    public int ServerId
    {
        get; set;
    }
}
public record SaveRequest(Dictionary<string, JsonElement> Key, Dictionary<string, JsonElement> Before, Dictionary<string, JsonElement> Values, bool Synchronize);
public record TransferRequest(Dictionary<string, JsonElement> Key, Dictionary<string, JsonElement> Before, int NewAdherent, bool Synchronize);
public record DeleteRequest(Dictionary<string, JsonElement> Key, Dictionary<string, JsonElement> Before, string Confirmation);
public record BulkPreviewRequest(List<Dictionary<string, JsonElement>> Keys);
public record BulkDeleteRequest(List<DeleteRequest> Items, string Confirmation);
public record CreateRequest(Dictionary<string, JsonElement> Values);
public record LoginRequest(string Username, string Password);
public record ServerRequest(string Label, string Host, int Port, string Username, string? Password, string SslMode);
public record StationRequest(string Code, string Label, int ServerId, bool IsMaster);
public record ContextRequest(int StationId, string DatabaseName, string Label, bool ReadOnly, int? LocalRefsta);
public record UserRequest(string Username, string DisplayName, string Role, string Password, int[] ContextIds);
public record RouteRequest(int SourceContextId, int TargetContextId);
