#if WINDOWS
using NFCWriter.Shared.Interfaces;
using Serilog;

public class NfcService : INfcService
{
    public event EventHandler<string> TagRead;

    public void StartListening()
    {
        Log.Information("NFC non supporté sur Windows — service simulé activé.");
        TagRead?.Invoke(this, "Mode NFC simulé actif (aucune lecture réelle).");
    }

    public void StopListening()
    {
        Log.Information("NFC simulé désactivé sur Windows.");
    }
}
#endif