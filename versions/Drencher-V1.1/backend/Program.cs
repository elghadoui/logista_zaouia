using Dapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading.RateLimiting;
using Vitasouss;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: false);
var keyPath = Path.GetFullPath(builder.Configuration["Security:KeyDirectory"] ?? "keys", builder.Environment.ContentRootPath);
builder.Services.AddDataProtection().SetApplicationName("Vitasouss.Referentiels.V1").PersistKeysToFileSystem(new DirectoryInfo(keyPath));
if (OperatingSystem.IsWindows()) builder.Services.AddDataProtection().ProtectKeysWithDpapi();
builder.Services.AddSingleton<Connections>();
builder.Services.AddScoped<PermissionService>();
builder.Services.AddScoped<DrencherService>();
builder.Services.AddSingleton<Catalog>();
builder.Services.AddScoped<ReferentialService>();
builder.Services.AddScoped<PresentationService>();
builder.Services.AddScoped<IntegrityService>();
builder.Services.AddScoped<KpiService>();
builder.Services.AddScoped<ComparisonService>();
builder.Services.AddScoped<SyncService>();
builder.Services.AddSingleton<PilotCatalog>();
builder.Services.AddScoped<PilotService>();
builder.Services.AddScoped<ComplementaryService>();
builder.Services.AddScoped<RelationService>();
var assistantOptions = new AssistantOptions();
builder.Configuration.GetSection("Assistant").Bind(assistantOptions);
assistantOptions.Normalize();
builder.Services.AddSingleton(assistantOptions);
builder.Services.AddSingleton<IOpenAiSecretStore, OpenAiSecretStore>();
builder.Services.AddSingleton<AssistantConversations>();
builder.Services.AddSingleton<AssistantAudit>();
builder.Services.AddHttpClient<IAssistantProvider, OpenAiAssistantProvider>(client => client.Timeout = Timeout.InfiniteTimeSpan)
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false });
builder.Services.AddScoped<AssistantService>();
builder.Services.AddSingleton<PasswordHasher<string>>();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
{
    options.Cookie.Name = "vitasouss_session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = builder.Configuration.GetValue("Security:SecureCookies", true) ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = false;
    options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
    options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
    options.Events.OnValidatePrincipal = async ctx =>
    {
        var connections = ctx.HttpContext.RequestServices.GetRequiredService<Connections>();
        await using var db = await connections.Admin();
        var principal = ctx.Principal!;
        var user = await db.QuerySingleOrDefaultAsync("SELECT enabled,auth_version,role FROM app_users WHERE id=@id", new
        {
            id = principal.FindFirstValue(ClaimTypes.NameIdentifier)
        });
        if (user is null)
        {
            ctx.RejectPrincipal();
            return;
        }
        if (!Convert.ToBoolean(user.enabled) || Convert.ToString(user.auth_version) != principal.FindFirstValue("version") || (string)user.role != principal.FindFirstValue(ClaimTypes.Role))
            ctx.RejectPrincipal();
    };
});
builder.Services.AddAuthorization(options => options.AddPolicy("Admin", policy => policy.RequireRole("Admin")));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("login", ctx => RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 8, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("assistant", ctx => RateLimitPartition.GetFixedWindowLimiter(ctx.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous", _ => new FixedWindowRateLimiterOptions { PermitLimit = assistantOptions.RequestsPerMinute, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
var app = builder.Build();
if (args.Contains("--protect-openai-secret"))
{
    try { ((OpenAiSecretStore)app.Services.GetRequiredService<IOpenAiSecretStore>()).ProtectInteractive(); }
    catch (AssistantFailure ex) { Console.Error.WriteLine("Protection OpenAI non réalisée : " + ex.Code); Environment.ExitCode = 1; }
    catch { Console.Error.WriteLine("Protection OpenAI non réalisée : vérifiez les droits et le répertoire de clés."); Environment.ExitCode = 1; }
    return;
}
if (args.Contains("--protect-admin-secret"))
{
    var secret = Environment.GetEnvironmentVariable("VITASOUSS_ADMIN_PASSWORD") ?? throw new Exception("VITASOUSS_ADMIN_PASSWORD requis");
    Console.WriteLine(app.Services.GetRequiredService<Connections>().Protect(secret));
    return;
}
if (args.Contains("--bootstrap-admin"))
{
    var password = Environment.GetEnvironmentVariable("VITASOUSS_BOOTSTRAP_PASSWORD") ?? throw new Exception("VITASOUSS_BOOTSTRAP_PASSWORD requis");
    if (password.Length < 12)
        throw new Exception("Mot de passe : 12 caractères minimum");
    await using var db = await app.Services.GetRequiredService<Connections>().Admin();
    if (await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_users") > 0)
        throw new Exception("Bootstrap interdit : utilisateurs existants");
    var username = Environment.GetEnvironmentVariable("VITASOUSS_BOOTSTRAP_USER") ?? "admin";
    var hash = app.Services.GetRequiredService<PasswordHasher<string>>().HashPassword(username, password);
    await db.ExecuteAsync("INSERT INTO app_users(username,display_name,password_hash,role) VALUES(@username,'Administrateur',@hash,'Admin')", new
    {
        username,
        hash
    });
    Console.WriteLine("Administrateur créé. Supprimez la variable du mot de passe de bootstrap.");
    return;
}
app.Use(async (ctx, next) =>
{
    try
    {
        await next();
    }
    catch (RuleException ex) { if (!ctx.Response.HasStarted) { ctx.Response.StatusCode = ex.Status; await ctx.Response.WriteAsJsonAsync(new { title = ex.Message, status = ex.Status }); } }
    catch (Exception ex) { app.Logger.LogError(ex, "Échec {TraceId}", ctx.TraceIdentifier); if (!ctx.Response.HasStarted) { ctx.Response.StatusCode = 503; await ctx.Response.WriteAsJsonAsync(new { title = "Service indisponible. Vérifiez la configuration et les connexions. Aucun détail de connexion n’est exposé.", traceId = ctx.TraceIdentifier }); } }
});
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path.Value?.EndsWith("/assistant/chat", StringComparison.Ordinal) == true)
    {
        var limit = assistantOptions.MaxQuestionCharacters * 6L + 2048;
        if (ctx.Request.ContentLength > limit) { ctx.Response.StatusCode = 413; await ctx.Response.WriteAsJsonAsync(new { title = "Question trop volumineuse." }); return; }
        var feature = ctx.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpMaxRequestBodySizeFeature>();
        if (feature is { IsReadOnly: false }) feature.MaxRequestBodySize = limit;
    }
    ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["X-Frame-Options"] = "DENY";
    ctx.Response.Headers["Referrer-Policy"] = "same-origin";
    ctx.Response.Headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'";
    if (ctx.Request.Path.StartsWithSegments("/api"))
        ctx.Response.Headers.CacheControl = "no-store";
    // Connexion et mutations : protection origine + jeton lié à la session.
    if (!HttpMethods.IsGet(ctx.Request.Method) && ctx.Request.Path.StartsWithSegments("/api"))
    {
        var origin = ctx.Request.Headers.Origin.ToString();
        if (!string.IsNullOrEmpty(origin) && (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) || uri.Authority != ctx.Request.Host.Value))
            throw new RuleException("Origine non autorisée.", 403);
    }
    await next();
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.Use(async (ctx,next) => { if(ctx.User.Identity?.IsAuthenticated==true && ctx.Request.Path.StartsWithSegments("/api")) await ctx.RequestServices.GetRequiredService<PermissionService>().CheckRequest(ctx); await next(); });
app.Use(async (ctx, next) =>
{
    if (ctx.User.Identity?.IsAuthenticated == true && !HttpMethods.IsGet(ctx.Request.Method) && ctx.Request.Path.StartsWithSegments("/api") && ctx.Request.Path != "/api/auth/login")
    {
        if (ctx.Request.Headers["X-CSRF-Token"] != ctx.User.FindFirstValue("csrf"))
            throw new RuleException("Jeton de session invalide.", 403);
    }
    await next();
});
app.MapGet("/api/health", () => new { status = "ok", version = "1.4.1", drencherVersion = "1.1" });
app.MapPost("/api/auth/login", async (LoginRequest request, HttpContext ctx, Connections connections, PasswordHasher<string> hasher) =>
{
    if (request.Username.Length > 100 || request.Password.Length > 512)
        throw new RuleException("Identifiants invalides.", 401);
    await using var db = await connections.Admin();
    var user = await db.QuerySingleOrDefaultAsync("SELECT * FROM app_users WHERE username=@username AND enabled=1", new
    {
        username = request.Username
    });
    // Même travail de hachage lorsque le compte n’existe pas.
    var hash = user is null ? hasher.HashPassword("invalid", "not-a-login-password") : (string)user.password_hash;
    var valid = hasher.VerifyHashedPassword(request.Username, hash, request.Password);
    if (user is null || valid == PasswordVerificationResult.Failed)
        throw new RuleException("Identifiants invalides.", 401);
    if (valid == PasswordVerificationResult.SuccessRehashNeeded)
        await db.ExecuteAsync("UPDATE app_users SET password_hash=@hash WHERE id=@id", new
        {
            hash = hasher.HashPassword(request.Username, request.Password),
            id = (int)user.id
        });
    var csrf = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    var claims = new[] { new Claim(ClaimTypes.NameIdentifier, Convert.ToString(user.id)), new Claim(ClaimTypes.Name, (string)user.display_name), new Claim(ClaimTypes.Role, (string)user.role), new Claim("version", Convert.ToString(user.auth_version)), new Claim("csrf", csrf) };
    await ctx.SignInAsync(new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
    return Results.Ok(new
    {
        name = (string)user.display_name,
        role = (string)user.role,
        csrf
    });
}).RequireRateLimiting("login");
var api = app.MapGroup("/api").RequireAuthorization();
DrencherEndpoints.Map(api);
api.MapGet("/contexts/{contextId:int}/comparison-targets", async (int contextId, ComparisonService comparison, ClaimsPrincipal user) => await comparison.Targets(contextId, user));
api.MapGet("/contexts/{contextId:int}/comparison", async (int contextId, int targetId, string name, string? search, string? status, int? page, int? pageSize, ComparisonService comparison, ClaimsPrincipal user, CancellationToken cancellation) => await comparison.Report(contextId, targetId, name, search, status ?? "All", page ?? 1, pageSize ?? 25, user, cancellation));
api.MapGet("/contexts/{contextId:int}/comparison/export", async (int contextId, int targetId, string name, string? search, string? status, ComparisonService comparison, ClaimsPrincipal user, CancellationToken cancellation) => Results.File(await comparison.Export(contextId, targetId, name, search, status ?? "All", user, cancellation), "text/csv; charset=utf-8", $"comparaison-{name}-ZAOUIA-DIAF.csv"));
api.MapGet("/assistant", (AssistantService assistant) => assistant.Status());
api.MapGet("/permissions", (PermissionService permissions,ClaimsPrincipal user)=>permissions.For(user));
api.MapGet("/contexts/{contextId:int}/assistant/tools/{name}", async (int contextId, string name, int? refadh, Connections connections, AssistantService assistant, ClaimsPrincipal user) => await assistant.Tool(await connections.Resolve(contextId, user), name, refadh));
api.MapPost("/contexts/{contextId:int}/assistant/chat", async (int contextId, AssistantQuestion request, Connections connections, AssistantService assistant, ClaimsPrincipal user, CancellationToken cancellation) => await assistant.Chat(await connections.Resolve(contextId, user), request, user, cancellation)).RequireRateLimiting("assistant");
api.MapDelete("/contexts/{contextId:int}/assistant/conversations/{id}", async (int contextId, string id, Connections connections, AssistantService assistant, ClaimsPrincipal user) => { await connections.Resolve(contextId, user); assistant.NewConversation(contextId, id, user); return Results.NoContent(); });
api.MapGet("/pilot/catalog", (PilotCatalog catalog) => catalog.Entities.Where(e => PilotCatalog.References.Contains(e.Name)));
api.MapGet("/contexts/{contextId:int}/pilot/{name}", async (int contextId, string name, string? search, string? filters, int? page, Connections connections, PilotService pilot, ClaimsPrincipal user) => await pilot.Read(await connections.Resolve(contextId, user), name, search, filters, page ?? 1));
api.MapGet("/contexts/{contextId:int}/pilot/{name}/options",async(int contextId,string name,Connections connections,RelationService relations,PilotCatalog catalog,ClaimsPrincipal user)=>{catalog.Get(name);var permissions=new PermissionService(connections);foreach(var parent in RelationService.Fields(name).Values.Select(v=>v.Table).Distinct().Where(PermissionService.Modules.Contains))await permissions.Demand(user,parent);if(name=="declaration_verger")await permissions.Demand(user,"adherent");return await relations.Options(await connections.Resolve(contextId,user),name);});
api.MapGet("/contexts/{contextId:int}/pilot/grpemb/articles",async(int contextId,int codgre,Connections connections,ClaimsPrincipal user)=>{await new PermissionService(connections).Demand(user,"groupart"); await using var db=await connections.Business(await connections.Resolve(contextId,user));return await db.QueryAsync("SELECT codgrp,type FROM groupart WHERE codgre=@codgre ORDER BY type LIMIT 100",new{codgre});});
api.MapPost("/contexts/{contextId:int}/pilot/{name}", async (int contextId, string name, PilotMutation request, Connections connections, ComplementaryService service, ClaimsPrincipal user) => await service.Write(await connections.Resolve(contextId, user, true), user, name, request, true));
api.MapPut("/contexts/{contextId:int}/pilot/{name}", async (int contextId, string name, PilotMutation request, Connections connections, ComplementaryService service, ClaimsPrincipal user) => await service.Write(await connections.Resolve(contextId, user, true), user, name, request, false));
api.MapPost("/contexts/{contextId:int}/pilot/{name}/delete", async (int contextId, string name, PilotMutation request, Connections connections, ComplementaryService service, ClaimsPrincipal user) => await service.Write(await connections.Resolve(contextId, user, true), user, name, request, false,true));
api.MapGet("/contexts/{contextId:int}/boards/{module}", async (int contextId, string module, string? search, string? filters, int? page, string? from, string? to, Connections connections, PilotService pilot, ClaimsPrincipal user) => await pilot.Board(await connections.Resolve(contextId, user), module, search, filters, page ?? 1, from, to));
api.MapPost("/contexts/{contextId:int}/comparison/prepare", async (int contextId, ComparisonPrepareRequest request, Connections connections, SyncService sync, ClaimsPrincipal user) => await sync.PrepareComparison(await connections.Resolve(contextId, user, true), user, request));
api.MapGet("/contexts/{contextId:int}/synchronization/targets",async(int contextId,ComparisonService comparison,ClaimsPrincipal user)=>await comparison.Targets(contextId,user));
api.MapPost("/contexts/{contextId:int}/synchronization/prepare",async(int contextId,RecordSyncRequest request,Connections connections,SyncService sync,ClaimsPrincipal user)=>await sync.PrepareRecord(await connections.Resolve(contextId,user,true),user,request.Name,request.TargetId,request.Key));
api.MapGet("/contexts/{contextId:int}/pilot/{name}/protection",async(int contextId,string name,string key,Connections connections,ComplementaryService service,ClaimsPrincipal user)=>await service.Protection(await connections.Resolve(contextId,user),name,Json.Read(key)));
api.MapGet("/contexts/{contextId:int}/entities/{name}/kpis", async (int contextId, string name, string? search, string? filter, string? value, string? filters, Connections connections, KpiService kpis, ClaimsPrincipal user) => await kpis.Read(await connections.Resolve(contextId, user), name, search, filter, value, filters));
api.MapGet("/contexts/{contextId:int}/entities/{name}/presentation", async (int contextId, string name, string key, Connections connections, PresentationService presentation, ClaimsPrincipal user) => await presentation.Details(await connections.Resolve(contextId, user), name, Json.Read(key)));
api.MapGet("/contexts/{contextId:int}/lookups/{name}", async (int contextId, string name, string? search, string? selected, string? variety, Connections connections, PresentationService presentation, ClaimsPrincipal user) => await presentation.Lookup(await connections.Resolve(contextId, user), name, search, selected, variety));
api.MapGet("/auth/me", (ClaimsPrincipal user) => new { name = user.Identity!.Name, role = user.FindFirstValue(ClaimTypes.Role), csrf = user.FindFirstValue("csrf") });
api.MapPost("/auth/logout", async (HttpContext ctx) => { await ctx.SignOutAsync(); return Results.NoContent(); });
api.MapGet("/catalog", (Catalog catalog) => catalog.Entities.Select(e => new { e.Name, e.Keys, e.Label, columns = e.Columns.Select(c => new { c.Name, c.Definition, c.Generated, c.Nullable, c.Numeric, c.Date, c.MaxLength }) }));
api.MapGet("/pilot-catalog",(PilotCatalog catalog)=>catalog.Entities.Where(e=>PilotCatalog.References.Contains(e.Name)).Select(e=>new{e.Name,e.Keys,e.Label,columns=e.Columns.Select(c=>new{c.Name,c.Definition,c.Generated,c.Nullable,c.Numeric,c.Date,c.MaxLength})}));
api.MapGet("/contexts", async (Connections connections, ClaimsPrincipal user) =>
{
    await using var db = await connections.Admin();
    return await db.QueryAsync("SELECT c.id,s.code station,c.label,c.database_name databaseName,c.read_only readOnly,s.is_master isMaster,c.local_refsta localRefsta FROM app_contexts c JOIN app_stations s ON s.id=c.station_id WHERE c.enabled=1 AND (@isAdmin=1 OR EXISTS(SELECT 1 FROM app_user_contexts u WHERE u.context_id=c.id AND u.user_id=@uid)) ORDER BY s.code,c.read_only,c.id DESC", new
    {
        isAdmin = user.IsInRole("Admin"),
        uid = user.FindFirstValue(ClaimTypes.NameIdentifier)
    });
});
api.MapGet("/contexts/{contextId:int}/dashboard", async (int contextId, Connections connections, ClaimsPrincipal user) =>
{
    var context = await connections.Resolve(contextId, user);
    await using var db = await connections.Business(context);
    await using var admin = await connections.Admin();
    var counts = new Dictionary<string, long>();
    foreach (var table in new[] { "adherent", "verger", "parcelle", "variete" })
        counts[table] = await db.ExecuteScalarAsync<long>($"SELECT COUNT(*) FROM `{table}`");
    var recent = await admin.QueryAsync("SELECT c.id,c.entity,c.record_key,c.operation,c.status,c.created_at createdAt,u.display_name userName FROM app_changes c JOIN app_users u ON u.id=c.user_id WHERE c.context_id=@contextId ORDER BY c.created_at DESC LIMIT 8", new
    {
        contextId, visible=(await new PermissionService(connections).For(user)).Where(p=>p.View).Select(p=>p.Module).ToArray()
    });
    var sync = await admin.QueryAsync("SELECT j.status,COUNT(*) count FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE c.context_id=@contextId GROUP BY j.status", new
    {
        contextId, visible=(await new PermissionService(connections).For(user)).Where(p=>p.View).Select(p=>p.Module).ToArray()
    });
    var configured = await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_sync_routes WHERE source_context_id=@contextId AND enabled=1", new
    {
        contextId, visible=(await new PermissionService(connections).For(user)).Where(p=>p.View).Select(p=>p.Module).ToArray()
    });
    return new
    {
        counts,
        recent,
        sync,
        diafConfigured = configured > 0
    };
});
api.MapGet("/contexts/{contextId:int}/entities/{name}", async (int contextId, string name, string? search, int? page, int? pageSize, string? sort, bool? descending, string? filter, string? value, bool? presentation, string? filters, Connections connections, ReferentialService service, ClaimsPrincipal user) => await service.List(await connections.Resolve(contextId, user), name, search, page ?? 1, pageSize ?? 25, sort, descending ?? false, filter, value, presentation ?? false, filters));
api.MapGet("/contexts/{contextId:int}/entities/{name}/record", async (int contextId, string name, string key, Connections connections, ReferentialService service, Catalog catalog, ClaimsPrincipal user) =>
{
    var context = await connections.Resolve(contextId, user);
    await using var db = await connections.Business(context);
    return await service.Record(db, catalog.Get(name), Json.Read(key));
});
api.MapPut("/contexts/{contextId:int}/entities/{name}/record", async (int contextId, string name, SaveRequest request, Connections connections, ReferentialService service, ClaimsPrincipal user) => await service.Save(await connections.Resolve(contextId, user, true), user, name, request));
api.MapPost("/contexts/{contextId:int}/vergers/transfer", async (int contextId, TransferRequest request, Connections connections, IntegrityService integrity, ClaimsPrincipal user) => await integrity.Transfer(await connections.Resolve(contextId, user, true), user, request));
api.MapGet("/contexts/{contextId:int}/entities/{name}/delete-preview", async (int contextId, string name, string key, Connections connections, IntegrityService integrity, ClaimsPrincipal user) => await integrity.Preview(await connections.Resolve(contextId, user, true), name, Json.Read(key)));
api.MapPost("/contexts/{contextId:int}/entities/{name}/delete", async (int contextId, string name, DeleteRequest request, Connections connections, IntegrityService integrity, ClaimsPrincipal user) => await integrity.Delete(await connections.Resolve(contextId, user, true), user, name, request));
api.MapPost("/contexts/{contextId:int}/entities/{name}/delete-batch-preview", async (int contextId, string name, BulkPreviewRequest request, Connections connections, IntegrityService integrity, ClaimsPrincipal user) => await integrity.PreviewBatch(await connections.Resolve(contextId, user, true), name, request));
api.MapPost("/contexts/{contextId:int}/entities/{name}/delete-batch", async (int contextId, string name, BulkDeleteRequest request, Connections connections, IntegrityService integrity, ClaimsPrincipal user) => await integrity.DeleteBatch(await connections.Resolve(contextId, user, true), user, name, request));
api.MapPost("/contexts/{contextId:int}/entities/{name}", async (int contextId, string name, CreateRequest request, Connections connections, ReferentialService service, ClaimsPrincipal user) => await service.Create(await connections.Resolve(contextId, user, true), user, name, request));
api.MapDelete("/contexts/{contextId:int}/entities/{name}/record", async (int contextId, string name, Connections connections, Catalog catalog, ClaimsPrincipal user) => { await connections.Resolve(contextId, user, true); catalog.Get(name); return Results.Problem("Suppression physique interdite en V1 pour préserver les données historiques.", statusCode: 409); });
api.MapGet("/contexts/{contextId:int}/entities/{name}/dependencies", async (int contextId, string name, string key, Connections connections, ReferentialService service, ClaimsPrincipal user) => await service.Dependencies(await connections.Resolve(contextId, user), name, Json.Read(key)));
api.MapGet("/contexts/{contextId:int}/entities/{name}/comparison", async (int contextId, string name, string key, Connections connections, SyncService sync, ClaimsPrincipal user) => await sync.Compare(await connections.Resolve(contextId, user), user, name, Json.Read(key)));
api.MapGet("/contexts/{contextId:int}/journal", async (int contextId, Connections connections, ClaimsPrincipal user) =>
{
    await connections.Resolve(contextId, user);
    await using var db = await connections.Admin();
    return await db.QueryAsync("SELECT c.*,u.display_name userName FROM app_changes c JOIN app_users u ON u.id=c.user_id WHERE c.context_id=@contextId AND c.entity IN @visible ORDER BY c.created_at DESC LIMIT 200", new
    {
        contextId, visible=(await new PermissionService(connections).For(user)).Where(p=>p.View).Select(p=>p.Module).ToArray()
    });
});
api.MapGet("/contexts/{contextId:int}/sync", async (int contextId, Connections connections, ClaimsPrincipal user) =>
{
    await connections.Resolve(contextId, user);
    await using var db = await connections.Admin();
    return await db.QueryAsync("SELECT j.*,c.entity,c.record_key,c.context_id source_context_id,c.status source_status,s.code target_station,t.label target_label FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id JOIN app_contexts t ON t.id=j.target_context_id JOIN app_stations s ON s.id=t.station_id WHERE c.context_id=@contextId AND c.entity IN @visible ORDER BY j.created_at DESC LIMIT 200", new
    {
        contextId, visible=(await new PermissionService(connections).For(user)).Where(p=>p.View).Select(p=>p.Module).ToArray()
    });
});
api.MapGet("/sync/{id}/preview", async (string id, SyncService sync, ClaimsPrincipal user) => await sync.Preview(id, user));
api.MapPost("/sync/{id}/apply", async (string id, Dictionary<string, JsonElement> before, SyncService sync, ClaimsPrincipal user) => await sync.Apply(id, user, before));
api.MapPost("/admin/changes/{id}/reconcile", async (string id, SyncService sync, ClaimsPrincipal user) => await sync.Reconcile(id, user)).RequireAuthorization("Admin");
api.MapPost("/admin/sync/{id}/reconcile", async (string id, SyncService sync, ClaimsPrincipal user) => await sync.ReconcileJob(id, user)).RequireAuthorization("Admin");
AdminEndpoints.Map(api);
app.MapFallback(async ctx =>
{
    if (ctx.Request.Path.StartsWithSegments("/api"))
    {
        ctx.Response.StatusCode = 404;
        return;
    }
    var path = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "index.html");
    if (File.Exists(path))
    {
        ctx.Response.ContentType = "text/html; charset=utf-8";
        await ctx.Response.SendFileAsync(path);
    }
    else
    {
        ctx.Response.StatusCode = 503;
        await ctx.Response.WriteAsync("Frontend non compilé : suivez le README.");
    }
});
app.Run();









