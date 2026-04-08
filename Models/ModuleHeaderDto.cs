namespace api.Models
{
    public class ModuleHeaderDto
    {
        public int? Id { get; set; } 
        
        public string? Header { get; set; }
        
        public int? Sequence  { get; set; }

        public char Mode { get; set; }
    }
}