using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("ScreenMaster")]
    public class ScreenMaster
    {
        [Key]
        public long SysId { get; set; }

        public string? ScreenName { get; set; }
        public string? TableName { get; set; }
        public string? ViewName { get; set; }
        public bool? IsSubmit { get; set; }
        public string? ScreenType { get; set; }
        public string? Navigation { get; set; }

        public string? Addbtn_qry { get; set; }

        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }

        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        // ✅ Soft delete
        public bool IsDeleted { get; set; } = false;
    }
}
