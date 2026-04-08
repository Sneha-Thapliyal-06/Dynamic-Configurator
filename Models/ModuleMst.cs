using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("ModuleMaster")]
    public class ModuleMst
    {
        [Key]
        public long id { get; set; }
        public string? ModuleName { get; set; }
        public string? icon { get; set; }

        public string? Status { get; set; } 
        public string? Link { get; set; }
        
        public int? Sequence { get; set; }
        public int? HeaderId { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}