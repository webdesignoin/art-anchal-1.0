import React, { useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, CheckCircle, UserPlus, Clock, Users, Calendar, TrendingUp, CalendarDays, DollarSign, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminHRTab({ dbEmployees, dbAttendance, dbProfiles, dbExpenses = [], fetchAllData }: { dbEmployees: any[], dbAttendance: any[], dbProfiles: any[], dbExpenses: any[], fetchAllData: () => void }) {
  const { t, language } = useLanguage();
  const [feedback, setFeedback] = useState("");
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any | null>(null);
  
  // Search user profile state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [employeeForm, setEmployeeForm] = useState({ role: "sales representative", base_salary: 0 });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const tHR = (key: string): string => {
    if (language === "hi") {
      const trans: Record<string, string> = {
        "Staff Directory": "कर्मचारी निर्देशिका (Staff Directory)",
        "No employees added yet.": "अभी तक कोई कर्मचारी नहीं जोड़ा गया है।",
        "View Stats": "विवरण देखें",
        "Base Salary": "मूल वेतन",
        "Pay": "वेतन दें",
        "Daily Attendance": "दैनिक उपस्थिति (Attendance)",
        "Add employees to track attendance.": "उपस्थिति दर्ज करने के लिए कर्मचारी जोड़ें।",
        "Present": "उपस्थित",
        "Absent": "अनुपस्थित",
        "Half Day": "हाफ डे",
        "Leave": "छुट्टी",
        "Add New Employee": "नया कर्मचारी जोड़ें",
        "Select User Profile *": "यूज़र प्रोफ़ाइल चुनें *",
        "Search name, email, or phone...": "नाम, ईमेल या फोन खोजें...",
        "Clear": "साफ़ करें",
        "Selected:": "चुना गया:",
        "Role / Designation *": "पद / भूमिका *",
        "Sales Representative": "बिक्री प्रतिनिधि (Sales)",
        "Affiliate": "संबद्ध (Affiliate)",
        "Attendents": "सहायक (Attendant)",
        "sales representative": "बिक्री प्रतिनिधि",
        "attendents": "सहायक (Attendant)",
        "Base Salary (₹)": "मूल वेतन (₹)",
        "Cancel": "रद्द करें",
        "Save Employee": "कर्मचारी सुरक्षित करें",
        "Attendance Rate": "उपस्थिति दर",
        "Days Tracked": "कुल ट्रैक किए गए दिन",
        "Present / Absent": "उपस्थित / अनुपस्थित",
        "Attendance History": "उपस्थिति इतिहास",
        "No attendance logged yet.": "अभी तक कोई उपस्थिति दर्ज नहीं है।",
        "Salary Payout History": "वेतन भुगतान इतिहास",
        "No salary payouts logged yet.": "अभी तक कोई वेतन भुगतान दर्ज नहीं है।",
        "Close Profile": "प्रोफ़ाइल बंद करें",
        "present": "उपस्थित",
        "absent": "अनुपस्थित",
        "half-day": "हाफ डे",
        "leave": "छुट्टी"
      };
      return trans[key] || key;
    }
    return key;
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !employeeForm.role) {
      alert(language === "hi" ? "कृपया एक यूज़र प्रोफ़ाइल और भूमिका चुनें।" : "Please select a user profile and role.");
      return;
    }
    const { error } = await supabase.from("employees").insert({
      name: selectedProfile.name,
      role: employeeForm.role,
      base_salary: Number(employeeForm.base_salary),
      phone: selectedProfile.phone || null
    });
    if (error) { alert(error.message); return; }
    setIsEmployeeModalOpen(false);
    setSelectedProfile(null);
    setUserSearchQuery("");
    setEmployeeForm({ role: "sales representative", base_salary: 0 });
    fetchAllData();
    showFeedback(language === "hi" ? "यूज़र प्रोफ़ाइल से कर्मचारी सफलतापूर्वक जोड़ा गया।" : "Employee added successfully from user profile.");
  };

  const handlePaySalary = async (emp: any) => {
    const confirmMsg = language === "hi" 
      ? `क्या आप ${emp.name} को ₹${emp.base_salary} वेतन भुगतान की पुष्टि करते हैं?` 
      : `Confirm salary disbursement of ₹${emp.base_salary} to ${emp.name}?`;
    if (!confirm(confirmMsg)) return;
    
    const { error } = await supabase.from("expenses").insert({
      category: "Salary",
      amount: Number(emp.base_salary),
      description: `Monthly salary payout for ${emp.name} (${emp.role})`,
      date: new Date().toISOString().split('T')[0]
    });
    if (error) {
      alert(`Error disbursing salary: ${error.message}`);
    } else {
      showFeedback(language === "hi" ? `${emp.name} का वेतन ₹${emp.base_salary} फाइनेंस खर्चों में दर्ज हो गया है!` : `Salary of ₹${emp.base_salary} logged in Finance expenses!`);
      fetchAllData();
    }
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
          <h2 className="font-serif text-3xl text-brand-maroon font-light">{t("admin_hr_title")}</h2>
          <p className="text-xs text-brand-warm-gray mt-0.5">{t("admin_hr_desc")}</p>
        </div>
        <button onClick={() => setIsEmployeeModalOpen(true)}
          className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-5 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition">
          <UserPlus className="w-4 h-4" /> {t("admin_hr_add_emp")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employees List */}
        <div className="bg-[#FAF7F2] border border-brand-gold/15 rounded-lg overflow-hidden flex flex-col max-h-[600px]">
          <div className="px-5 py-4 border-b border-brand-gold/15 flex items-center gap-2 bg-[#1C050E] text-[#F9F5F0]">
            <Users className="w-4 h-4 text-brand-gold" />
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-gold">{tHR("Staff Directory")}</h3>
          </div>
          <div className="overflow-y-auto p-5 space-y-3 flex-1">
            {dbEmployees.length === 0 ? (
              <p className="text-center text-xs text-brand-warm-gray italic py-8">{tHR("No employees added yet.")}</p>
            ) : (
              dbEmployees.map(emp => (
                <div key={emp.id} className="flex justify-between items-center border border-brand-gold/20 p-4 rounded-lg bg-white shadow-sm gap-2">
                  <div>
                    <p className="font-serif font-bold text-brand-maroon text-xs hover:underline cursor-pointer flex items-center gap-1.5" onClick={() => setViewingEmployee(emp)}>
                      {emp.name}
                      <span className="text-[9px] font-sans font-normal border border-brand-maroon/20 px-1 py-0.2 rounded text-brand-maroon/80 bg-brand-sand/15">{tHR("View Stats")}</span>
                    </p>
                    <p className="text-[10px] text-brand-warm-gray font-mono uppercase tracking-wider">{tHR(emp.role)} • {emp.phone || (language === "hi" ? "कोई फोन नहीं" : "No phone")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-brand-warm-gray uppercase tracking-widest">{tHR("Base Salary")}</p>
                      <p className="font-mono font-bold text-brand-maroon">₹{Number(emp.base_salary).toLocaleString("en-IN")}</p>
                    </div>
                    <button onClick={() => handlePaySalary(emp)}
                      className="bg-brand-gold/20 text-brand-gold-dark hover:bg-brand-gold hover:text-[#1C050E] text-[9px] uppercase font-bold px-2.5 py-1.5 rounded transition">
                      {tHR("Pay")}
                    </button>
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
              <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-gold">{tHR("Daily Attendance")}</h3>
            </div>
            <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-brand-ivory text-brand-maroon text-xs px-2 py-1 font-mono outline-none rounded" />
          </div>
          <div className="overflow-y-auto p-5 space-y-3 flex-1">
            {dbEmployees.length === 0 ? (
              <p className="text-center text-xs text-brand-warm-gray italic py-8">{tHR("Add employees to track attendance.")}</p>
            ) : (
              dbEmployees.map(emp => {
                const status = getAttendanceForDate(emp.id);
                return (
                  <div key={emp.id} className="flex flex-col sm:flex-row justify-between sm:items-center border border-brand-gold/20 p-4 rounded-lg bg-white shadow-sm gap-3">
                    <p className="font-serif font-bold text-brand-maroon text-xs min-w-[120px] hover:underline cursor-pointer" onClick={() => setViewingEmployee(emp)}>{emp.name}</p>
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
                          {tHR(opt.label)}
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

      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-brand-maroon/40 backdrop-blur-sm" onClick={() => setIsEmployeeModalOpen(false)}>
          <div className="relative w-full max-w-md bg-[#FDFBF7] border-t sm:border border-brand-gold/25 rounded-t-3xl sm:rounded-lg shadow-2xl animate-slide-up flex flex-col max-h-[92vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center px-5 sm:px-6 pt-5 pb-3 border-b border-brand-gold/15 flex-shrink-0">
              <h3 className="font-serif text-xl text-brand-maroon">{tHR("Add New Employee")}</h3>
              <button onClick={() => setIsEmployeeModalOpen(false)} className="text-brand-warm-gray hover:text-brand-maroon transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddEmployee} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 space-y-4">
              
              {/* User profile dropdown search */}
              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tHR("Select User Profile *")}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={tHR("Search name, email, or phone...")}
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs"
                  />
                  {selectedProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProfile(null);
                        setUserSearchQuery("");
                      }}
                      className="bg-red-100 text-red-700 px-3 py-2.5 hover:bg-red-200 text-[10px] font-bold uppercase transition"
                    >
                      {tHR("Clear")}
                    </button>
                  )}
                </div>

                {isDropdownOpen && userSearchQuery && (
                  <div className="absolute left-0 right-0 z-50 bg-white border border-brand-gold/20 shadow-lg max-h-48 overflow-y-auto mt-1 divide-y divide-brand-gold/10 rounded-lg">
                    {dbProfiles
                      .filter((p: any) =>
                        p.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        p.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        p.phone?.includes(userSearchQuery)
                      )
                      .slice(0, 10)
                      .map((profile: any) => (
                        <div
                          key={profile.id}
                          onClick={() => {
                            setSelectedProfile(profile);
                            setUserSearchQuery(profile.name);
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-2.5 text-xs hover:bg-brand-sand/50 cursor-pointer flex justify-between"
                        >
                          <span className="font-bold text-brand-maroon">{profile.name}</span>
                          <span className="text-brand-warm-gray text-[10px]">{profile.email || profile.phone}</span>
                        </div>
                      ))}
                  </div>
                )}
                {selectedProfile && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded mt-1.5 font-bold uppercase">
                    {tHR("Selected:")} {selectedProfile.name} ({selectedProfile.email || selectedProfile.phone})
                  </p>
                )}
              </div>

              {/* Roles Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tHR("Role / Designation *")}</label>
                <select
                  required
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                  className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon text-xs"
                >
                  <option value="sales representative">{tHR("Sales Representative")}</option>
                  <option value="Affiliate">{tHR("Affiliate")}</option>
                  <option value="attendents">{tHR("Attendents")}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold block text-brand-maroon">{tHR("Base Salary (₹)")}</label>
                  <input type="number" min="0" required value={employeeForm.base_salary} onChange={e => setEmployeeForm({ ...employeeForm, base_salary: Number(e.target.value) })}
                    className="w-full bg-white border border-brand-gold/20 p-2.5 focus:outline-none focus:border-brand-maroon font-mono text-xs" />
                </div>
              </div>

              </div>
              {/* Sticky footer */}
              <div className="flex justify-end gap-3 px-5 sm:px-6 pt-4 pb-20 lg:pb-4 border-t border-brand-gold/15 bg-[#FDFBF7] flex-shrink-0">
                <button type="button" onClick={() => setIsEmployeeModalOpen(false)}
                  className="text-brand-warm-gray uppercase tracking-wider text-[10px] font-bold px-4 py-2.5 hover:text-brand-maroon transition">{tHR("Cancel")}</button>
                <button type="submit"
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-6 py-3 hover:bg-brand-maroon/90 transition shadow">
                  {tHR("Save Employee")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Employee Stats / History Modal */}
      {viewingEmployee && (() => {
        const empAttendance = dbAttendance.filter(a => a.employee_id === viewingEmployee.id);
        const presentCount = empAttendance.filter(a => a.status === 'present').length;
        const absentCount = empAttendance.filter(a => a.status === 'absent').length;
        const halfDayCount = empAttendance.filter(a => a.status === 'half-day').length;
        const leaveCount = empAttendance.filter(a => a.status === 'leave').length;
        const totalTracked = empAttendance.length;
        const attendanceRate = totalTracked > 0 ? Math.round((presentCount / totalTracked) * 100) : 100;

        const empSalaryPayments = dbExpenses.filter(exp => 
          exp.category === "Salary" && 
          exp.description?.toLowerCase().includes(viewingEmployee.name.toLowerCase())
        );

        return (
          <div className="fixed inset-0 z-[100] bg-[#1C050E]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setViewingEmployee(null)}>
            <div className="bg-[#FAF7F2] max-w-2xl w-full border-t sm:border border-brand-gold/30 rounded-t-3xl sm:rounded-lg shadow-2xl p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up relative" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1.5 bg-brand-gold/20 rounded-full mx-auto sm:hidden mb-1"></div>
              <button onClick={() => setViewingEmployee(null)} className="absolute top-5 right-5 text-brand-warm-gray hover:text-brand-maroon transition">
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-brand-gold/15 pb-4 mb-6">
                <h3 className="font-serif text-2xl text-brand-maroon font-light">{viewingEmployee.name}</h3>
                <p className="text-xs text-brand-warm-gray font-mono uppercase tracking-widest mt-1">
                  {tHR(viewingEmployee.role)} • {viewingEmployee.phone || (language === "hi" ? "कोई फोन नंबर नहीं" : "No phone number listed")}
                </p>
              </div>

              {/* KPI Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-brand-gold/15 p-4 rounded text-center shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-brand-warm-gray font-bold font-sans">{tHR("Attendance Rate")}</p>
                  <p className="font-serif text-2xl text-brand-maroon font-bold mt-1">{attendanceRate}%</p>
                </div>
                <div className="bg-white border border-brand-gold/15 p-4 rounded text-center shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-brand-warm-gray font-bold font-sans">{tHR("Days Tracked")}</p>
                  <p className="font-serif text-2xl text-brand-maroon font-bold mt-1">{totalTracked}</p>
                </div>
                <div className="bg-white border border-brand-gold/15 p-4 rounded text-center shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-brand-warm-gray font-bold font-sans">{tHR("Present / Absent")}</p>
                  <p className="font-serif text-xl text-brand-maroon font-bold mt-1.5 text-emerald-700">
                    {presentCount} <span className="text-brand-warm-gray font-normal text-xs">/</span> <span className="text-red-600">{absentCount}</span>
                  </p>
                </div>
                <div className="bg-white border border-brand-gold/15 p-4 rounded text-center shadow-sm">
                  <p className="text-[9px] uppercase tracking-widest text-brand-warm-gray font-bold font-sans">{tHR("Base Salary")}</p>
                  <p className="font-serif text-xl text-brand-maroon font-bold mt-1.5">₹{Number(viewingEmployee.base_salary).toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Attendance History */}
                <div className="bg-white border border-brand-gold/15 rounded-lg p-5">
                  <h4 className="font-serif text-sm font-bold text-brand-maroon mb-3 flex items-center gap-2 border-b border-brand-gold/10 pb-2">
                    <CalendarDays className="w-4 h-4 text-brand-gold" /> {tHR("Attendance History")}
                  </h4>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 divide-y divide-brand-gold/10">
                    {empAttendance.length === 0 ? (
                      <p className="text-xs text-brand-warm-gray italic py-4">{tHR("No attendance logged yet.")}</p>
                    ) : (
                      empAttendance.map(record => {
                        const statusColors: Record<string, string> = {
                          present: "bg-emerald-100 text-emerald-800",
                          absent: "bg-red-100 text-red-800",
                          "half-day": "bg-amber-100 text-amber-800",
                          leave: "bg-blue-100 text-blue-800"
                        };
                        return (
                          <div key={record.id} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-mono text-brand-warm-gray">{record.date}</span>
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${statusColors[record.status] || "bg-gray-100 text-gray-800"}`}>
                              {tHR(record.status)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Salary Payouts History */}
                <div className="bg-white border border-brand-gold/15 rounded-lg p-5">
                  <h4 className="font-serif text-sm font-bold text-brand-maroon mb-3 flex items-center gap-2 border-b border-brand-gold/10 pb-2">
                    <DollarSign className="w-4 h-4 text-brand-gold" /> {tHR("Salary Payout History")}
                  </h4>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 divide-y divide-brand-gold/10">
                    {empSalaryPayments.length === 0 ? (
                      <p className="text-xs text-brand-warm-gray italic py-4">{tHR("No salary payouts logged yet.")}</p>
                    ) : (
                      empSalaryPayments.map(payout => (
                        <div key={payout.id} className="py-2 text-xs">
                          <div className="flex justify-between font-bold text-brand-maroon">
                            <span className="font-mono text-[10px] text-brand-warm-gray">{payout.date}</span>
                            <span className="font-mono text-emerald-700">₹{Number(payout.amount).toLocaleString("en-IN")}</span>
                          </div>
                          <p className="text-[10px] text-brand-warm-gray mt-0.5 truncate">{payout.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-brand-gold/15 mt-6">
                <button type="button" onClick={() => setViewingEmployee(null)}
                  className="bg-brand-maroon text-brand-ivory uppercase tracking-widest text-[10px] font-bold px-6 py-3 hover:bg-brand-maroon/90 transition shadow">
                  {tHR("Close Profile")}
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
