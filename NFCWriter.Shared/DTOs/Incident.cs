namespace NFCWriter.Shared.DTOs
{
    public class Incident
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public string Solution { get; set; }
        public Incident() { } // <- required for JSON deserialization

        public Incident(int id, string desc, string sol)
        {
            Id = id; Description = desc; Solution = sol;
        }
    }
}