namespace api.Models
{
    public class GroupDto
    {
        public int? SysID { get; set; }
        public int ScreenId { get; set; }
        public string? Sequence { get; set; }
        public string? Colspan { get; set; }
        public string? Heading { get; set; }
        public string? GroupType { get; set; }
        public string? GroupIcon { get; set; }
        public string? GroupTable { get; set; }
        public string? GroupViewTable { get; set; }
        public string? Query { get; set; }
        public bool? IsMain { get; set; }
        public string? LinkButton { get; set; }
        public string? Status { get; set; }
        public string? Navigation { get; set; }
        public string? Edit_qry { get; set; }
        public string? Delete_qry { get; set; }

        public int? UserId { get; set; } 
        public char Mode { get; set; } // A, E, D
    }
}