namespace Vitasouss;

// Quantities are consumed amounts. A positive delta returns stock; a negative delta consumes it.
public static class DrencherStockPlan {
 public static Dictionary<int,decimal> Difference(IReadOnlyDictionary<int,decimal> accounted,IReadOnlyDictionary<int,decimal> desired) {
  if(accounted.Any(p=>p.Value<0)||desired.Any(p=>p.Value<0))throw new RuleException("Journal ou répartition incohérent : quantité nette négative.",409);
  return accounted.Keys.Union(desired.Keys).Order().ToDictionary(id=>id,id=>accounted.GetValueOrDefault(id)-desired.GetValueOrDefault(id));
 }
 public static decimal Balance(decimal available,decimal delta) {
  var result=available+delta;
  if(result<0||result>999999999999.999999m)throw new RuleException("Stock insuffisant ou capacité du stock dépassée. Aucune soumission ou correction appliquée.",409);
  return result;
 }
}
