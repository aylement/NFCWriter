namespace NFCWriter.Shared.Interfaces
{
    public interface INfcService
    {
        void StartListening();
        void StopListening();
        event EventHandler<string> TagRead;
    }
}
