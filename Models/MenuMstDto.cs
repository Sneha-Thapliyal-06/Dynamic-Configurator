namespace api.Models
{
    public class MenuMstDto
    {
        public long? id { get; set; }
        public long? moduleId { get; set; }
        public string? ScreenName { get; set; }
        public string? icon { get; set; }
        public string? ScreenUrl { get; set; }
        public string? IsSelfService { get; set; }
        public bool IsActive { get; set; }
        public string? Status { get; set; }

        public int? UserId { get; set; }
        public int? Sequence { get; set; } 
        public char Mode { get; set; } 
    }
}