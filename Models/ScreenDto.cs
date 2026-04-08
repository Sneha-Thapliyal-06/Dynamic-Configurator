namespace api.Models
{
    public class ScreenDto
    {
        public long? SysId { get; set; } 
        public string? ScreenName { get; set; }
        public string? TableName { get; set; }
        public string? ViewName { get; set; }
        public bool IsSubmit { get; set; }
        public string? ScreenType { get; set; }
        public string? Navigation { get; set; }
        public string? Addbtn_qry { get; set; }

        public int? UserId { get; set; } 

        public char Mode { get; set; }
    }
}