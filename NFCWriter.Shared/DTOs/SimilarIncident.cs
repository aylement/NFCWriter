namespace NFCWriter.Shared.DTOs
{
    public class SimilarIncident(int id, string desc, string sol) : Incident(id, desc, sol)
    {
        public float Similarity { get; set; }
    }
}