using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/screens")]
    public class ScreenController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ScreenController(AppDbContext context)
        {
            _context = context;
        }

        
        [HttpGet]
        public async Task<IActionResult> GetScreens()
        {
            var data = await _context.ScreenMaster
                .Where(x => !x.IsDeleted)
                .ToListAsync();

            return Ok(data);
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetScreenById(long id)
        {
            var screen = await _context.ScreenMaster
                .FirstOrDefaultAsync(x => x.SysId == id && !x.IsDeleted);

            if (screen == null)
                return NotFound($"Screen with ID {id} not found.");

            return Ok(screen);
        }

  
        [HttpPost("manage")]
        public async Task<IActionResult> ManageScreen([FromBody] ScreenDto model)
        {
            if (model == null) return BadRequest("Invalid request body.");

            DateTime currentTime = DateTime.Now;

            switch (char.ToUpper(model.Mode))
            {
                case 'A': // CREATE
                    var newEntry = new ScreenMaster
                    {
                        ScreenName = model.ScreenName,
                        TableName = model.TableName,
                        ViewName = model.ViewName,
                        IsSubmit = model.IsSubmit,
                        ScreenType = model.ScreenType,
                        Navigation = model.Navigation,
                        Addbtn_qry = model.Addbtn_qry,
                        
                        CreatedBy = model.UserId,
                        CreatedOn = currentTime, 
                        ModifiedBy = model.UserId,
                        ModifiedOn = currentTime, // Creation ke waqt dono dates same
                        
                        IsDeleted = false
                    };

                    _context.ScreenMaster.Add(newEntry);
                    await _context.SaveChangesAsync();
                    return Ok(newEntry);

                case 'E': //  UPDATE
                    if (model.SysId == null) return BadRequest("SysId is required for editing.");

                    var existing = await _context.ScreenMaster
                        .FirstOrDefaultAsync(x => x.SysId == model.SysId && !x.IsDeleted);

                    if (existing == null) return NotFound("Record not found.");

                    existing.ScreenName = model.ScreenName;
                    existing.TableName = model.TableName;
                    existing.ViewName = model.ViewName;
                    existing.IsSubmit = model.IsSubmit;
                    existing.ScreenType = model.ScreenType;
                    existing.Navigation = model.Navigation;
                    existing.Addbtn_qry = model.Addbtn_qry;

                    existing.ModifiedBy = model.UserId;
                    existing.ModifiedOn = currentTime; // Sirf modified update hoga

                    await _context.SaveChangesAsync();
                    return Ok(existing);

                case 'D': //  SOFT DELETE
                    if (model.SysId == null) return BadRequest("SysId is required for deletion.");

                    var toDelete = await _context.ScreenMaster
                        .FirstOrDefaultAsync(x => x.SysId == model.SysId && !x.IsDeleted);

                    if (toDelete == null) return NotFound("Record not found.");

                    toDelete.IsDeleted = true;
                    toDelete.ModifiedBy = model.UserId;
                    toDelete.ModifiedOn = currentTime; // Deletion date record karne ke liye

                    await _context.SaveChangesAsync();
                    return Ok(new { Message = "Screen deleted successfully", SysId = model.SysId });

                default:
                    return BadRequest("Invalid Mode. Use 'A' (Add), 'E' (Edit), or 'D' (Delete).");
            }
        }
    }
}