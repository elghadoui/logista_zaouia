using MySqlConnector;
using System.Globalization;
namespace Vitasouss;
public static class DrDates
{
 public static DateTime? Value(object? value)=>value switch {
  null or DBNull=>null,
  MySqlDateTime m=>m.IsValidDateTime?m.GetDateTime():null,
  DateTime d=>d.Year>1?d:null,
  DateOnly d=>d.ToDateTime(TimeOnly.MinValue),
  string s when DateTime.TryParse(s,CultureInfo.InvariantCulture,DateTimeStyles.None,out var d)&&d.Year>1=>d,
  _=>null
 };
 public static string? Day(object? value)=>Value(value)?.ToString("yyyy-MM-dd",CultureInfo.InvariantCulture);
 public static string? Instant(object? value)=>Value(value)?.ToString("yyyy-MM-dd'T'HH:mm:ss",CultureInfo.InvariantCulture);
 public static Dictionary<string,object?> Row(object row){
  var result=((IDictionary<string,object>)row).ToDictionary(e=>e.Key,e=>(object?)e.Value);
  foreach(var key in result.Keys.ToArray())if(result[key] is MySqlDateTime or DateTime or DateOnly)result[key]=key.Equals("peremption",StringComparison.OrdinalIgnoreCase)||key.Equals("dateReception",StringComparison.OrdinalIgnoreCase)?Day(result[key]):Instant(result[key]);
  return result;
 }
}
