using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/group-fields")]
    public class GroupFieldsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupFieldsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/group-fields
        [HttpGet]
        public async Task<IActionResult> GetAllFields()
        {
            var data = await _context.GroupFieldsMaster
                .Where(x => !x.IsDeleted)
                .ToListAsync();
            return Ok(data);
        }

        // FIX: Yeh method ab GroupId ke basis par fields return karega
        // GET: api/group-fields/1066
        // GET: api/group-fields/1066
        // GET: api/group-fields/1066
        // GET: api/group-fields/1066
        [HttpGet("{groupId:long}")]
        public async Task<IActionResult> GetFieldsByGroupId(long groupId)
        {
            try 
            {
                // Database table 'GroupFieldsMaster' mein 'GroupId' column se match karein
                var data = await _context.GroupFieldsMaster
                    .Where(x => x.GroupId == groupId && !x.IsDeleted)
                    .OrderBy(x => x.Sequence)
                    .ToListAsync();

                // 404 se bachne ke liye empty array [] bhejein agar data na ho
                return Ok(data); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        // POST: api/group-fields/manage
        [HttpPost("manage")]
        public async Task<IActionResult> ManageFields([FromBody] GroupFieldsDto model)
        {
            if (model == null) return BadRequest("Invalid request.");

            switch (char.ToUpper(model.Mode))
            {
                case 'A':
                    var newField = new GroupFieldsMaster
                    {
                        GroupId = model.GroupId,
                        LookUpId = model.LookUpId,
                        IsPrimery = model.IsPrimery,
                        FKId = model.FKId,
                        FieldName = model.FieldName,
                        FieldType = model.FieldType,
                        FieldControl = model.FieldControl,
                        HintText = model.HintText,
                        LabelText = model.LabelText,
                        ShowInGrid = model.ShowInGrid,
                        ShowInScreen = model.ShowInScreen,
                        Sequence = model.Sequence,
                        IsDeleted = false
                    };
                    _context.GroupFieldsMaster.Add(newField);
                    await _context.SaveChangesAsync();
                    return Ok(newField);

                case 'E':
                    if (model.SysId == null || model.SysId == 0) return BadRequest("SysId is required for Edit.");
                    var existing = await _context.GroupFieldsMaster
                        .FirstOrDefaultAsync(x => x.SysId == model.SysId && !x.IsDeleted);

                    if (existing == null) return NotFound("Field not found.");

                    // Fields update logic
                    existing.GroupId = model.GroupId;
                    existing.LookUpId = model.LookUpId;
                    existing.IsPrimery = model.IsPrimery;
                    existing.FKId = model.FKId;
                    existing.FieldName = model.FieldName;
                    existing.FieldType = model.FieldType;
                    existing.FieldControl = model.FieldControl;
                    existing.HintText = model.HintText;
                    existing.LabelText = model.LabelText;
                    existing.ShowInGrid = model.ShowInGrid;
                    existing.ShowInScreen = model.ShowInScreen;
                    existing.Sequence = model.Sequence;

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D':
                    if (model.SysId == null || model.SysId == 0) return BadRequest("SysId is required for Delete.");
                    var toDelete = await _context.GroupFieldsMaster
                        .FirstOrDefaultAsync(x => x.SysId == model.SysId && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Field not found.");

                    toDelete.IsDeleted = true; // Soft delete
                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Deleted successfully" });

                default:
                    return BadRequest("Invalid Mode.");
            }
        }
    }
}