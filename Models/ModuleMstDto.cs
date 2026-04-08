namespace api.Models
{
    public class ModuleMstDto
    {
        public long? id { get; set; }
        public string? ModuleName { get; set; }
        public string? icon { get; set; }
        public string? Status { get; set; }
        public string? Link { get; set; }
        public int? Sequence { get; set; }
        public int? HeaderId { get; set; }

        public char Mode { get; set; } 
    }
}