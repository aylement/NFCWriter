using Microsoft.Extensions.Logging;
using NFCWriter.Shared.Interfaces;
using Serilog;

namespace NFCWriter
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.Seq("http://localhost:5341")
            .Enrich.WithThreadId()
            .Enrich.WithProcessId()
            .Enrich.WithProperty("App", "MyMauiBlazorApp")
            .CreateLogger();

            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            // Add device-specific services used by the NFCWriter.Shared project
            builder.Services.AddSingleton(new HttpClient());
            builder.Services.AddSingleton<BombermanHubClient>();
            builder.Services.AddSingleton<ITagStorageService, TagStorageService>();
#if ANDROID
            builder.Services.AddSingleton<INfcService, NfcService>();
#endif

#if IOS
            builder.Services.AddSingleton<INfcService, NfcService>();
#endif
#if WINDOWS
            builder.Services.AddSingleton<INfcService, NfcService>();
#endif
            builder.Services.AddMauiBlazorWebView();

#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}