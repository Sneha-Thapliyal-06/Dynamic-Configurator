using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("ModuleHeader")]
    public class ModuleHeader
    {
        [Key]
        public int Id { get; set; } 
        
        public string? Header { get; set; }
        
        public int? Sequence  { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}