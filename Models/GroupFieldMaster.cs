using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("GroupFieldsMaster")]
    public class GroupFieldsMaster
    {
        [Key]
        public long SysId { get; set; }
        public long? GroupId { get; set; }
        public long? LookUpId { get; set; }
        public bool? IsPrimery { get; set; }
        public bool? FKId { get; set; }
        public string? FieldName { get; set; }
        public string? FieldType { get; set; }
        public string? FieldControl { get; set; }
        public string? HintText { get; set; }
        public string? LabelText { get; set; }
        public bool? ShowInGrid { get; set; }
        public bool? ShowInScreen { get; set; }
        public long? Sequence { get; set; }

        // Soft Delete
        public bool IsDeleted { get; set; } = false;
    }
}