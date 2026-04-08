using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("MenuMaster")]
    public class MenuMst
    {
        [Key]
        public long id { get; set; } // SQL identity column
        public long? moduleId { get; set; }
        public string? ScreenName { get; set; }
        public string? icon { get; set; }
        public string? ScreenUrl { get; set; }
        public string? IsSelfService { get; set; }
        public bool IsActive { get; set; }
        public string? Status { get; set; }

        // Audit Fields
        public int? CreatedBy { get; set; }
        public DateTime? CreatedOn { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedOn { get; set; }

        public int? Sequence { get; set; }

        // Soft Delete
        public bool IsDeleted { get; set; } = false;
    }
}