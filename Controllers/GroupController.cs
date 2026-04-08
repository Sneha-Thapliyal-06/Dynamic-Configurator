using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/groups")]
    public class GroupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var data = await _context.GroupMaster
                .Where(x => !x.IsDeleted)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroupById(int id)
        {
            var record = await _context.GroupMaster
                .FirstOrDefaultAsync(x => x.SysID == id && !x.IsDeleted);

            if (record == null) return NotFound($"Group with ID {id} not found.");
            return Ok(record);
        }

        [HttpPost("manage")]
        public async Task<IActionResult> ManageGroup([FromBody] GroupDto model)
        {
            if (model == null) return BadRequest("Invalid request.");
            DateTime currentTime = DateTime.Now;

            switch (char.ToUpper(model.Mode))
            {
                case 'A': // CREATE
                    var newGroup = new GroupMaster
                    {
                        ScreenId = model.ScreenId,
                        Sequence = model.Sequence,
                        Colspan = model.Colspan,
                        Heading = model.Heading,
                        GroupType = model.GroupType,
                        GroupIcon = model.GroupIcon,
                        GroupTable = model.GroupTable,
                        GroupViewTable = model.GroupViewTable,
                        Query = model.Query,
                        IsMain = model.IsMain,
                        LinkButton = model.LinkButton,
                        Status = model.Status,
                        Navigation = model.Navigation,
                        CreatedBy = model.UserId,
                        CreatedOn = currentTime,
                        ModifiedBy = model.UserId,
                        ModifiedOn = currentTime,
                        Edit_qry = model.Edit_qry,
                        Delete_qry = model.Delete_qry,
                        IsDeleted = false
                    };
                    _context.GroupMaster.Add(newGroup);
                    await _context.SaveChangesAsync();
                    return Ok(newGroup);

                case 'E': // EDIT
                    if (model.SysID == null) return BadRequest("SysID is required for editing.");
                    var existing = await _context.GroupMaster
                        .FirstOrDefaultAsync(x => x.SysID == model.SysID && !x.IsDeleted);

                    if (existing == null) return NotFound("Record not found.");

                    existing.ScreenId = model.ScreenId;
                    existing.Sequence = model.Sequence;
                    existing.Colspan = model.Colspan;
                    existing.Heading = model.Heading;
                    existing.GroupType = model.GroupType;
                    existing.GroupIcon = model.GroupIcon;
                    existing.GroupTable = model.GroupTable;
                    existing.GroupViewTable = model.GroupViewTable;
                    existing.Query = model.Query;
                    existing.IsMain = model.IsMain;
                    existing.LinkButton = model.LinkButton;
                    existing.Status = model.Status;
                    existing.Navigation = model.Navigation;
                    existing.ModifiedBy = model.UserId;
                    existing.ModifiedOn = currentTime;

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D': // DELETE
                    if (model.SysID == null) return BadRequest("SysID is required for deletion.");
                    var toDelete = await _context.GroupMaster
                        .FirstOrDefaultAsync(x => x.SysID == model.SysID && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Record not found.");

                    toDelete.IsDeleted = true;
                    toDelete.ModifiedBy = model.UserId;
                    toDelete.ModifiedOn = currentTime;

                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Group deleted successfully", SysID = model.SysID });

                default:
                    return BadRequest("Invalid Mode. Use 'A', 'E', or 'D'.");
            }
        }
    }
}