import React, { useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, CheckCircle, UserPlus, Clock, Users } from "lucide-react";

export default function AdminHRTab({ dbEmployees, dbAttendance, fetchAllData }: { dbEmployees: any[], dbAttendance: any[], fetchAllData: () => void }) {
  const [feedback, setFeedback] = useState("");
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({ name: "", role: "", base_salary: 0, phone: "" });

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.role) return;
    const { error } = await supabase.from("employees").insert({
      name: employeeForm.name,
      role: employeeForm.role,
      base_salary: Number(employeeForm.base_salary),
      phone: employeeForm.phone || null
    });
    if (error) { alert(error.message); return; }
    setIsEmployeeModalOpen(false);
    setEmployeeForm({ name: "", role: "", base_salary: 0, phone: "" });
    fetchAllData();
    showFeedback("Employee added successfully.");
  };

  const handleMarkAttendance = async (employeeId: string, status: string) => {
    const { error } = await supabase.from("attendance").upsert({
      employee_id: employeeId,
      date: attendanceDate,
      status: status
    }, { onConflict: 'employee_id, date' });
    if (error) alert(error.message);
    else fetchAllData();
  };

  const getAttendanceForDate = (employeeId: string) => {
    return dbAttendance.find(a => a.employee_id === employeeId && a.date === attendanceDate)?.status || "unmarked";
  };

  return (
    <div className="space-y-6 animate-fade-in print:hidden">
      {feedback && (
        <div className="fixed top-5 right-5 z-50 bg-[#1C050E] text-brand-ivory text-xs px-5 py-3.5 border border-brand-gold/30 flex items-center gap-2 shadow-2xl rounded-lg animate-fade-in">
          <CheckCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
          {feedback}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-2xl text-brand-maroon font-light">HR & Staffing</h2>
          <p className="text-xs text-brand-warm-gray mt-0.5">Manage employees and daily attendance</p>
        </div>
        <button onClick={() => setIsEmployeeModalOpen(true)}
          className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-5 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition">
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employees List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col max-h-[600px]">
          <div className="px-5 py-4 border-b border-brand-gold/15 flex items-center gap-2 bg-[#1C050E] text-[#F9F5F0]">
            <Users className="w-4 h-4 text-brand-gold" />
            <h3 className="font-serif text-lg font-semibold">Staff Directory</h3>
          </div>
          <div className="overflow-y-auto p-5 space-y-3 flex-1">
            {dbEmployees.length === 0 ? (
              <p className="text-center text-xs text-brand-warm-gray italic py-8">No employees added yet.</p>
            ) : (
              dbEmployees.map(emp => (
                <div key={emp.id} className="flex justify-between items-center border border-brand-gold/20 p-4 rounded-lg bg-white shadow-sm">
                  <div>
                    <p className="font-serif font-bold text-brand-maroon text-sm">{emp.name}</p>
                    <p className="text-[10px] text-brand-warm-gray font-mono uppercase tracking-wider">{emp.role} • {emp.phone || "No phone"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-brand-warm-gray uppercase tracking-widest">Base Salary</p>
                    <p className="font-mono font-bold text-brand-maroon">₹{Number(emp.base_salary).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Tracker */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col max-h-[600px]">
          <div className="px-5 py-4 border-b border-brand-gold/15 flex justify-between items-center bg-[#1C050E] text-[#F9F5F0]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-gold" />
              <h3 className="font-serif text-lg font-semibold">Daily Attendance</h3>
            </div>
            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-brand-ivory text-brand-maroon text-xs px-2 py-1 font-mono outline-none rounded" />
          </div>
          <div className="overflow-y-auto p-5 space-y-3 flex-1">
            {dbEmployees.length === 0 ? (
              <p className="text-center text-xs text-brand-warm-gray italic py-8">Add employees to track attendance.</p>
            ) : (
              dbEmployees.map(emp => {
                const status = getAttendanceForDate(emp.id);
                return (
                  <div key={emp.id} className="flex flex-col sm:flex-row justify-between sm:items-center border border-brand-gold/20 p-4 rounded-lg bg-white shadow-sm gap-3">
                    <p className="font-serif font-bold text-brand-maroon text-sm min-w-[120px]">{emp.name}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { id: "present", label: "Present", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                        { id: "absent", label: "Absent", color: "bg-red-100 text-red-800 border-red-300" },
                        { id: "half-day", label: "Half Day", color: "bg-amber-100 text-amber-800 border-amber-300" },
                        { id: "leave", label: "Leave", color: "bg-blue-100 text-blue-800 border-blue-300" }
                      ].map(opt => (
                        <button key={opt.id} onClick={() => handleMarkAttendance(emp.id, opt.id)}
                          className={`text-[9px] uppercase font-bold px-2.5 py-1.5 rounded border transition ${
                            status === opt.id ? opt.color : "bg-brand-sand border-brand-gold/20 text-brand-warm-gray hover:border-brand-maroon"
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Add Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEmployeeModalOpen(false)}>
          <div className="bg-[#FAF7F2] max-w-md w-full border border-brand-gold/30 rounded-lg shadow-2xl p-6 lg:p-8 animate-fade-in relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl text-brand-maroon mb-6 font-light">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Full Name *</label>
                <input type="text" required value={employeeForm.name} onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">Role / Designation *</label>
                <input type="text" required value={employeeForm.role} onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                  placeholder="e.g. Master Weaver, Sales Exec" className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">Base Salary (₹)</label>
                  <input type="number" min="0" required value={employeeForm.base_salary} onChange={e => setEmployeeForm({ ...employeeForm, base_salary: Number(e.target.value) })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">Phone Number</label>
                  <input type="text" value={employeeForm.phone} onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon font-mono" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-gold/15 mt-6">
                <button type="button" onClick={() => setIsEmployeeModalOpen(false)}
                  className="text-brand-warm-gray uppercase text-[10px] font-bold px-4 py-2 hover:text-brand-maroon transition">Cancel</button>
                <button type="submit"
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-5 py-3 hover:bg-brand-maroon/90 transition shadow">
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
