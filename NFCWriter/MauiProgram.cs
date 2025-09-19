using Microsoft.Extensions.Logging;
using NFCWriter.Services;
using NFCWriter.Shared.Interfaces;
using NFCWriter.Shared.Services;

namespace NFCWriter
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            // Add device-specific services used by the NFCWriter.Shared project
            builder.Services.AddSingleton<IFormFactor, FormFactor>();
            builder.Services.AddSingleton(new HttpClient());
#if ANDROID
            builder.Services.AddSingleton<INfcService, NfcService>();
            builder.Services.AddSingleton<ITagStorageService, TagStorageService>();
#endif

#if IOS
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