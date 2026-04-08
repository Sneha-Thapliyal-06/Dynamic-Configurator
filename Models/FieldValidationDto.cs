namespace api.Models
{
    public class FieldValidationDto
    {
        public long? Id { get; set; }
        public long? GroupID { get; set; }
        public long? FieldID { get; set; }
        public string? Validation { get; set; }
        public string? Value { get; set; }
        public string? Status { get; set; }

        
        public char Mode { get; set; } // A, E, D
    }
}