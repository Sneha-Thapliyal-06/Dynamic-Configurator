namespace api.Models
{
    public class ApprovalDto {
        public long? Id { get; set; }
        public string? ApprovalName { get; set; }
        public char Mode { get; set; } // A, E, D
    }

    public class ApproverDto {
        public long? Id { get; set; }
        public long? ApprovalTypeID { get; set; }
        public string? EmployeeID { get; set; }

        public int? Sequence { get; set; }
        public char Mode { get; set; }
    }

    public class MappingDto {
        public long? Id { get; set; }
        public long? ScreenID { get; set; }
        public long? ApprovalID { get; set; }
        public char Mode { get; set; }
    }
}