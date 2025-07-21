#if ANDROID
using Android.Nfc;
using Android.Nfc.Tech;
using Android.Content;
using Microsoft.Maui.Controls;
using NFCWriter.Shared.Interfaces;

public class NfcService : Java.Lang.Object, INfcService, NfcAdapter.IReaderCallback
{
    private NfcAdapter _adapter;
    public event EventHandler<string> TagRead;

    public void StartListening()
    {
        var activity = Platform.CurrentActivity;
        _adapter = NfcAdapter.GetDefaultAdapter(activity);
        _adapter.EnableReaderMode(
        activity,
        this,
        NfcReaderFlags.NfcA,
        null
         );
    }

    public void StopListening()
    {
        _adapter?.DisableReaderMode(Platform.CurrentActivity);
    }

    public void OnTagDiscovered(Tag tag)
    {
        try
        {
            var id = BitConverter.ToString(tag.GetId()).Replace("-", "");
            TagRead?.Invoke(this, $"Tag UID: {id}");

            var ndef = Ndef.Get(tag);
            if (ndef != null)
            {
                ndef.Connect();
                var message = ndef.NdefMessage;
                foreach (var record in message.GetRecords())
                {
                    var payload = System.Text.Encoding.UTF8.GetString(record.GetPayload());
                    TagRead?.Invoke(this, $"Payload: {payload}");
                }
                ndef.Close();
            }
        }
        catch (Exception ex)
        {
            TagRead?.Invoke(this, $"Error reading tag: {ex.Message}");
        }
    }
}
#endif