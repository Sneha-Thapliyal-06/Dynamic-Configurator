using Microsoft.AspNetCore.Mvc;
using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("api/workflow")]
    public class WorkflowController : ControllerBase
    {
        private readonly AppDbContext _context;
        public WorkflowController(AppDbContext context) { _context = context; }

        [HttpGet("approval")]
        public async Task<IActionResult> GetApprovals() => 
            Ok(await _context.Approvals.Where(x => !x.IsDeleted).ToListAsync());

        [HttpGet("approval/{id}")]
        public async Task<IActionResult> GetApprovalById(int id) {
            var data = await _context.Approvals.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (data == null) return NotFound("Approval not found.");
            return Ok(data);
        }


        [HttpPost("manage-approval")]
        public async Task<IActionResult> ManageApproval([FromBody] ApprovalDto model)
        {
            if (model.Mode == 'A') {
                var newApproval = new Approval { ApprovalName = model.ApprovalName };
                _context.Approvals.Add(newApproval);
                await _context.SaveChangesAsync(); 
                

                return Ok(new { Id = newApproval.Id, Message = "Approval Success" });
            }
            else if (model.Mode == 'E') {
                var existing = await _context.Approvals.FindAsync(model.Id);
                if (existing != null) existing.ApprovalName = model.ApprovalName;
            }
            else if (model.Mode == 'D') {
                var toDelete = await _context.Approvals.FindAsync(model.Id);
                if (toDelete != null) toDelete.IsDeleted = true;
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Approval Success" });
        }
                
        [HttpGet("approver")]
        public async Task<IActionResult> GetApprovers() => 
            Ok(await _context.Approvers.Where(x => !x.IsDeleted).ToListAsync());

        [HttpGet("approver/{id}")]
        public async Task<IActionResult> GetApproverById(int id) {
            var data = await _context.Approvers.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (data == null) return NotFound("Approver not found.");
            return Ok(data);
        }

        [HttpPost("manage-approver")]
        public async Task<IActionResult> ManageApprover([FromBody] ApproverDto model)
        {
            if (model.Mode == 'A') _context.Approvers.Add(new Approver { 
                ApprovalTypeID = model.ApprovalTypeID, 
                EmployeeID = model.EmployeeID, 
                Sequence = model.Sequence });
            else if (model.Mode == 'E') {
                var existing = await _context.Approvers.FindAsync(model.Id);
                if (existing != null) {
                    existing.ApprovalTypeID = model.ApprovalTypeID;
                    existing.EmployeeID = model.EmployeeID;
                    existing.Sequence = model.Sequence;
                }
            }
            else if (model.Mode == 'D') {
                var toDelete = await _context.Approvers.FindAsync(model.Id);
                if (toDelete != null) toDelete.IsDeleted = true;
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Approver Success" });
        }


        [HttpGet("mapping")]
        public async Task<IActionResult> GetMappings() => 
            Ok(await _context.ApprovalScreenMappings.Where(x => !x.IsDeleted).ToListAsync());

        [HttpGet("mapping/{id}")]
        public async Task<IActionResult> GetMappingById(int id) {
            var data = await _context.ApprovalScreenMappings.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
            if (data == null) return NotFound("Mapping not found.");
            return Ok(data);
        }

        [HttpPost("manage-mapping")]
        public async Task<IActionResult> ManageMapping([FromBody] MappingDto model)
        {
            if (model.Mode == 'A') _context.ApprovalScreenMappings.Add(new ApprovalScreenMapping { ScreenID = model.ScreenID, ApprovalID = model.ApprovalID });
            else if (model.Mode == 'E') {
                var existing = await _context.ApprovalScreenMappings.FindAsync(model.Id);
                if (existing != null) {
                    existing.ScreenID = model.ScreenID;
                    existing.ApprovalID = model.ApprovalID;
                }
            }
            else if (model.Mode == 'D') {
                var toDelete = await _context.ApprovalScreenMappings.FindAsync(model.Id);
                if (toDelete != null) toDelete.IsDeleted = true;
            }
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Mapping Success" });
        }
    }
}