using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/menus")]
    public class MenuMstController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MenuMstController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.MenuMst
                .Where(x => !x.IsDeleted)
                .OrderBy(x => x.Sequence)
                .ToListAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var record = await _context.MenuMst
                .FirstOrDefaultAsync(x => x.id == id && !x.IsDeleted);

            if (record == null) return NotFound("Menu item not found.");
            return Ok(record);
        }

        [HttpPost("manage")]
        public async Task<IActionResult> Manage([FromBody] MenuMstDto model)
        {
            if (model == null) return BadRequest("Invalid request.");
            DateTime currentTime = DateTime.Now;

            switch (char.ToUpper(model.Mode))
            {
                case 'A': // CREATE
                    var newEntry = new MenuMst
                    {
                        moduleId = model.moduleId,
                        ScreenName = model.ScreenName,
                        icon = model.icon,
                        ScreenUrl = model.ScreenUrl,
                        IsSelfService = model.IsSelfService,
                        IsActive = true,
                        Status = model.Status,
                        CreatedBy = model.UserId,
                        CreatedOn = currentTime,
                        ModifiedBy = model.UserId,
                        ModifiedOn = currentTime,
                        IsDeleted = false,
                        Sequence = model.Sequence
                    };
                    _context.MenuMst.Add(newEntry);
                    await _context.SaveChangesAsync();
                    return Ok(newEntry);

                case 'E': // EDIT
                    if (model.id == null) return BadRequest("id is required for editing.");
                    var existing = await _context.MenuMst
                        .FirstOrDefaultAsync(x => x.id == model.id && !x.IsDeleted);

                    if (existing == null) return NotFound("Menu record not found.");

                    existing.moduleId = model.moduleId;
                    existing.ScreenName = model.ScreenName;
                    existing.icon = model.icon;
                    existing.ScreenUrl = model.ScreenUrl;
                    existing.IsSelfService = model.IsSelfService;
                    existing.IsActive = model.IsActive;
                    existing.Status = model.Status;
                    existing.ModifiedBy = model.UserId;
                    existing.ModifiedOn = currentTime;
                    existing.Sequence = model.Sequence; 

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D': // DELETE
                    if (model.id == null) return BadRequest("id is required for deletion.");
                    var toDelete = await _context.MenuMst
                        .FirstOrDefaultAsync(x => x.id == model.id && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Record not found.");

                    toDelete.IsDeleted = true;
                    toDelete.ModifiedBy = model.UserId;
                    toDelete.ModifiedOn = currentTime;

                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Menu item deleted successfully" });

                default:
                    return BadRequest("Invalid Mode.");
            }
        }
    }
}