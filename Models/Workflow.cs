using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{

    [Table("Approval")]
    public class Approval {
        [Key]
        public long Id { get; set; }
        [Column("Approval")] 
        public string? ApprovalName { get; set; } 
        public bool IsDeleted { get; set; } = false;
    }

    [Table("Approver")]
    public class Approver {
        [Key]
        public long Id { get; set; }
        public long? ApprovalTypeID { get; set; }
        public string? EmployeeID { get; set; } // Varchar for '@reportingTO'
        public int? Sequence { get; set; }
        //public string? EmployeeName { get; set; }
        public bool IsDeleted { get; set; } = false;
    }

    [Table("ApprovalScreenMapping")]
    public class ApprovalScreenMapping {
        [Key]
        public long Id { get; set; }
        public long? ScreenID { get; set; }
        public long? ApprovalID { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}