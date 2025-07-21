using CoreNFC;
using Foundation;
using NFCWriter.Shared.Interfaces;

public class NfcService : NSObject, INfcService, INFCNdefReaderSessionDelegate
{
    private NFCNdefReaderSession session;

    public event EventHandler<string> TagRead;

    public void StartListening()
    {
        if (NFCNdefReaderSession.ReadingAvailable)
        {
            session = new NFCNdefReaderSession(this, null, true);
            session.BeginSession();
        }
    }

    public void StopListening()
    {
        session?.InvalidateSession();
    }

    [Export("readerSession:didDetectNdefMessages:")]
    public void DidDetect(NFCNdefReaderSession session, NFCNdefMessage[] messages)
    {
        foreach (var message in messages)
        {
            foreach (var record in message.Records)
            {
                var payload = NSString.FromData(record.Payload, NSStringEncoding.UTF8);
                TagRead?.Invoke(this, payload.ToString());
            }
        }
    }

    [Export("readerSession:didInvalidateWithError:")]
    public void DidInvalidate(NFCNdefReaderSession session, NSError error) =>
        System.Diagnostics.Debug.WriteLine($"NFC Session invalidated: {error.LocalizedDescription}");
}