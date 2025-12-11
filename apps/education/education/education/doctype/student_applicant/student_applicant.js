// Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

// frappe.ui.form.on('Student Applicant', {
//   refresh: function (frm) {
//     frm.set_query('academic_term', function (doc, cdt, cdn) {
//       return {
//         filters: {
//           academic_year: frm.doc.academic_year,
//         },
//       }
//     })

//     if (!frm.is_new() && frm.doc.application_status === 'Applied') {
//       frm.add_custom_button(
//         __('Approve'),
//         function () {
//           frm.set_value('application_status', 'Approved')
//           frm.save_or_update()
//         },
//         'Actions'
//       )

//       frm.add_custom_button(
//         __('Reject'),
//         function () {
//           frm.set_value('application_status', 'Rejected')
//           frm.save_or_update()
//         },
//         'Actions'
//       )
//     }

//     if (!frm.is_new() && frm.doc.application_status === 'Approved') {
//       frm.add_custom_button(__('Enroll'), function () {
//         frm.events.enroll(frm)
//       })

//       frm.add_custom_button(
//         __('Reject'),
//         function () {
//           frm.set_value('application_status', 'Rejected')
//           frm.save_or_update()
//         },
//         'Actions'
//       )
//     }

//     if (!frm.is_new() && frm.doc.application_status === 'Rejected') {
//       frm.add_custom_button(
//         __('Approve'),
//         function () {
//           frm.set_value('application_status', 'Approved')
//           frm.save_or_update()
//         },
//         'Actions'
//       )
//     }

//     frappe.realtime.on('enroll_student_progress', function (data) {
//       if (data.progress) {
//         frappe.hide_msgprint(true)
//         frappe.show_progress(
//           __('Enrolling student'),
//           data.progress[0],
//           data.progress[1]
//         )
//       }
//     })

//     frappe.db.get_value(
//       'Education Settings',
//       { name: 'Education Settings' },
//       'user_creation_skip',
//       (r) => {
//         if (cint(r.user_creation_skip) !== 1) {
//           frm.set_df_property('student_email_id', 'reqd', 1)
//         }
//       }
//     )
//   },

//   enroll: function (frm) {
//     frappe.model.open_mapped_doc({
//       method: 'education.education.api.enroll_student',
//       frm: frm,
//     })
//   },
// })


frappe.ui.form.on('Student Applicant', {
  refresh: function (frm) {

    frm.set_query('academic_term', function () {
      return {
        filters: {
          academic_year: frm.doc.academic_year,
        },
      };
    });

    // ------------------------------------------------
    // When status = Applied
    // ------------------------------------------------
    if (!frm.is_new() && frm.doc.application_status === 'Applied') {

      frm.add_custom_button(__('Approve'), function () {
        frm.set_value('application_status', 'Approved');
        frm.save_or_update();
      }, 'Actions');

      frm.add_custom_button(__('Reject'), function () {
        frm.set_value('application_status', 'Rejected');
        frm.save_or_update();
      }, 'Actions');

      // ✅ Documents Verification (SAME AS APPROVE/REJECT)
      frm.add_custom_button(__('Documents Verification'), function () {
        frm.set_value('application_status', 'Documents Verification');
        frm.save_or_update();
      }, 'Actions');
    }

    // ------------------------------------------------
    // When status = Documents Verification
    // ------------------------------------------------
    if (!frm.is_new() && frm.doc.application_status === 'Documents Verification') {

      frm.add_custom_button(__('Approve'), function () {
        frm.set_value('application_status', 'Approved');
        frm.save_or_update();
      }, 'Actions');

      frm.add_custom_button(__('Reject'), function () {
        frm.set_value('application_status', 'Rejected');
        frm.save_or_update();
      }, 'Actions');
    }

    // ------------------------------------------------
    // When status = Approved
    // ------------------------------------------------
    if (!frm.is_new() && frm.doc.application_status === 'Approved') {

      frm.add_custom_button(__('Enroll'), function () {
        frm.events.enroll(frm);
      });

      frm.add_custom_button(__('Reject'), function () {
        frm.set_value('application_status', 'Rejected');
        frm.save_or_update();
      }, 'Actions');
    }

    // ------------------------------------------------
    // When status = Rejected
    // ------------------------------------------------
    if (!frm.is_new() && frm.doc.application_status === 'Rejected') {

      frm.add_custom_button(__('Approve'), function () {
        frm.set_value('application_status', 'Approved');
        frm.save_or_update();
      }, 'Actions');
    }

    // ------------------------------------------------
    // Enrollment progress
    // ------------------------------------------------
    frappe.realtime.on('enroll_student_progress', function (data) {
      if (data.progress) {
        frappe.hide_msgprint(true);
        frappe.show_progress(
          __('Enrolling student'),
          data.progress[0],
          data.progress[1]
        );
      }
    });

    // ------------------------------------------------
    // Make student email required
    // ------------------------------------------------
    frappe.db.get_value(
      'Education Settings',
      { name: 'Education Settings' },
      'user_creation_skip',
      (r) => {
        if (cint(r.user_creation_skip) !== 1) {
          frm.set_df_property('student_email_id', 'reqd', 1);
        }
      }
    );
  },

  enroll: function (frm) {
    frappe.model.open_mapped_doc({
      method: 'education.education.api.enroll_student',
      frm: frm,
    });
  },
});

