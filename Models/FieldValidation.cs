using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("FieldValidation")]
    public class FieldValidation
    {
        [Key]
        public long Id { get; set; }
        public long? GroupID { get; set; }
        public long? FieldID { get; set; }
        public string? Validation { get; set; } 
        public string? Value { get; set; }     
        public string? Status { get; set; }
        //public string? ErrorMessage { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}