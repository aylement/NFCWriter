#if ANDROID
using Android.Nfc;
using Android.Nfc.Tech;
using Serilog;
using NFCWriter.Shared.Interfaces;
using System.Diagnostics;

public class NfcService : Java.Lang.Object, INfcService, NfcAdapter.IReaderCallback
{
    private NfcAdapter? _adapter;
    public event EventHandler<string>? TagRead;

    public void StartListening()
    {
        try
        {
            var activity = Platform.CurrentActivity;
            _adapter = NfcAdapter.GetDefaultAdapter(activity);

            if (_adapter == null)
            {
                Log.Warning("NFC non disponible sur cet appareil Android.");
                return;
            }

            Log.Information("Activation du mode lecture NFC...");
            _adapter.EnableReaderMode(
                activity,
                this,
                NfcReaderFlags.NfcA,
                null
            );
            Log.Information("Mode lecture NFC activé avec succès.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Erreur lors de l'activation du mode lecture NFC.");
        }
    }

    public void StopListening()
    {
        try
        {
            _adapter?.DisableReaderMode(Platform.CurrentActivity);
            Log.Information("Mode lecture NFC désactivé.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Erreur lors de la désactivation du mode lecture NFC.");
        }
    }

    public void OnTagDiscovered(Tag? tag)
    {
        if(tag == null)
        {
            Log.Warning("Tag NFC découvert est null.");
            return;
        }
        var stopwatch = Stopwatch.StartNew();
        try
        {
            byte[]? tagId = tag.GetId();
            if(tagId == null || tagId.Length == 0)
            {
                Log.Warning("Tag NFC découvert avec un ID invalide.");
                return;
            }
            var id = Convert.ToHexString(tagId);
            Log.Information("Tag détecté : {TagId}", id);
            TagRead?.Invoke(this, $"Tag UID: {id}");

            var ndef = Ndef.Get(tag);
            if (ndef != null)
            {
                ndef.Connect();
                Log.Debug("Connexion au tag NFC réussie.");

                NdefMessage? message = ndef.NdefMessage;
                foreach (NdefRecord record in message?.GetRecords() ?? Enumerable.Empty<NdefRecord>())
                {
                    byte[]? recordPayload = record.GetPayload();
                    if(recordPayload == null || recordPayload.Length == 0)
                    {
                        Log.Warning("Enregistrement NDEF avec une charge utile vide.");
                        continue;
                    }
                    string? payload = System.Text.Encoding.UTF8.GetString(recordPayload);
                    Log.Information("Payload lu depuis le tag : {Payload}", payload);
                    TagRead?.Invoke(this, $"Payload: {payload}");
                }

                ndef.Close();
                Log.Debug("Tag NFC fermé proprement.");
            }
            else
            {
                Log.Warning("Tag détecté sans message NDEF valide.");
            }
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Erreur lors de la lecture du tag NFC.");
            TagRead?.Invoke(this, $"Error reading tag: {ex.Message}");
        }
        finally
        {
            stopwatch.Stop();
            Log.Information("Temps total de lecture du tag : {ElapsedMilliseconds} ms", stopwatch.ElapsedMilliseconds);
        }
    }
}
#endif