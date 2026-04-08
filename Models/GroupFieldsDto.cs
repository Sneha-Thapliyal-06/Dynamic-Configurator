namespace api.Models
{
    public class GroupFieldsDto
    {
        public long? SysId { get; set; }
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

        public char Mode { get; set; } // A, E, D
    }
}