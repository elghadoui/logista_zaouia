using System.Collections.Concurrent;
namespace Vitasouss;
public sealed class AssistantConversations
{
    public sealed class Conversation(string user, int context)
    {
        public string User { get; } = user;
        public int Context { get; } = context;
        public DateTime LastUsed { get; set; } = DateTime.UtcNow;
        public List<AssistantTurn> Turns { get; } = [];
        public SemaphoreSlim Gate { get; } = new(1);
    }
    private readonly ConcurrentDictionary<string, Conversation> conversations = new();
    private readonly object gate = new();
    public SemaphoreSlim GenerationSlots { get; } = new(16);
    public (string Id, Conversation Value) Get(string? id, string user, int context)
    {
        lock (gate)
        {
            foreach (var item in conversations.Where(c => c.Value.LastUsed < DateTime.UtcNow.AddMinutes(-30)).ToArray()) conversations.TryRemove(item.Key, out _);
            if (id is not null)
            {
                if (!conversations.TryGetValue(id, out var old) || old.User != user || old.Context != context) throw new RuleException("Conversation expirée ou non autorisée. Commencez une nouvelle conversation.", 403);
                old.LastUsed = DateTime.UtcNow;
                return (id, old);
            }
            if (conversations.Count >= 1000 || conversations.Count(c => c.Value.User == user) >= 8) throw new RuleException("Limite de conversations atteinte. Réessayez dans 30 minutes.", 429);
            var created = new Conversation(user, context); var newId = Guid.NewGuid().ToString("N"); conversations[newId] = created;
            return (newId, created);
        }
    }
    public void Remove(string id, string user, int context)
    {
        lock (gate)
        {
            if (conversations.TryGetValue(id, out var old) && old.User == user && old.Context == context) conversations.TryRemove(id, out _);
        }
    }
}
