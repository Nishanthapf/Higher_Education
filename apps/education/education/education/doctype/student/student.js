  // Copyright (c) 2016, Frappe Technologies Pvt. Ltd. and contributors
  // For license information, please see license.txt

  // frappe.ui.form.on('Student', {
  //   refresh: function (frm) {
  //     frm.set_query('user', function (doc) {
  //       return {
  //         filters: {
  //           ignore_user_type: 1,
  //         },
  //       }
  //     })

  //     if (!frm.is_new()) {
  //       frm.add_custom_button(__('Accounting Ledger'), function () {
  //         frappe.set_route('query-report', 'General Ledger', {
  //           party_type: 'Customer',
  //           party: frm.doc.customer,
  //         })
  //       })
  //     }

  //     frappe.db
  //       .get_single_value('Education Settings', 'user_creation_skip')
  //       .then((r) => {
  //         if (cint(r) !== 1) {
  //           frm.set_df_property('student_email_id', 'reqd', 1)
  //         }
  //       })
  //   },
  // })

  // frappe.ui.form.on('Student Guardian', {
  //   guardians_add: function (frm) {
  //     frm.fields_dict['guardians'].grid.get_field('guardian').get_query =
  //       function (doc) {
  //         let guardian_list = []
  //         if (!doc.__islocal) guardian_list.push(doc.guardian)
  //         $.each(doc.guardians, function (idx, val) {
  //           if (val.guardian) guardian_list.push(val.guardian)
  //         })
  //         return { filters: [['Guardian', 'name', 'not in', guardian_list]] }
  //       }
  //   },
  // })




  frappe.ui.form.on('Student', {
    refresh: function (frm) {

        // ---------------------------------------
        // Make "Action" the FIRST button
        // ---------------------------------------
        frm.clear_custom_buttons();

        // // Add main Action group button
        // frm.add_custom_button(__('Action'), function () {
        //     // When clicking Action → show status options directly
        // }, __('Actions'));

        // Add Status Buttons directly under Actions group
        frm.add_custom_button(__('Active'), function () {
            update_status(frm, "Active");
        }, __('Actions'));

        frm.add_custom_button(__('Inactive'), function () {
            update_status(frm, "Inactive");
        }, __('Actions'));

        frm.add_custom_button(__('Discontinue'), function () {
            update_status(frm, "Discontinue");
        }, __('Actions'));

        frm.add_custom_button(__('Alumni'), function () {
            update_status(frm, "Alumni");
        }, __('Actions'));

        // ---------------------------------------
        // Your existing code remains below
        // ---------------------------------------
        frm.set_query('user', function (doc) {
            return { filters: { ignore_user_type: 1 } };
        });

        if (!frm.is_new()) {
            frm.add_custom_button(__('Accounting Ledger'), function () {
                frappe.set_route('query-report', 'General Ledger', {
                    party_type: 'Customer',
                    party: frm.doc.customer,
                });
            });
        }

        frappe.db.get_single_value('Education Settings', 'user_creation_skip')
            .then((r) => {
                if (cint(r) !== 1) {
                    frm.set_df_property('student_email_id', 'reqd', 1);
                }
            });
    }
});

// ---------------------------------------
// Helper function for updating status
// ---------------------------------------
function update_status(frm, status) {
    frm.set_value('custom_status', status);
    frm.save();
    // frappe.msgprint(`Status updated to <b>${status}</b>`);
}
