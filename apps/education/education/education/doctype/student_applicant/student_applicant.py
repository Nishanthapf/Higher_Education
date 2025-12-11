# Copyright (c) 2015, Frappe Technologies
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import add_years, date_diff, getdate, nowdate


class StudentApplicant(Document):

    # --------------------------------------------------
    # NAMING
    # --------------------------------------------------
    def autoname(self):
        from frappe.model.naming import set_name_by_naming_series

        if self.student_admission:
            if self.program:
                student_admission = get_student_admission_data(
                    self.student_admission, self.program
                )
                if student_admission:
                    self.naming_series = student_admission.get(
                        "applicant_naming_series"
                    )
            else:
                frappe.throw(_("Select the program first"))

        set_name_by_naming_series(self)

    # --------------------------------------------------
    # VALIDATE
    # --------------------------------------------------
    def validate(self):
        self.set_title()
        self.validate_dates()
        self.validate_term()

        if self.student_admission and self.program and self.date_of_birth:
            self.validation_from_student_admission()

        # ✅ SCORE CHECK WITHOUT HOOK
        self.check_exam_score_and_update_status()

    # --------------------------------------------------
    # BASIC VALIDATIONS
    # --------------------------------------------------
    def set_title(self):
        self.title = " ".join(
            filter(None, [self.first_name, self.middle_name, self.last_name])
        )

    def validate_dates(self):
        if self.date_of_birth and getdate(self.date_of_birth) >= getdate():
            frappe.throw(_("Date of Birth cannot be greater than today."))

    def validate_term(self):
        if self.academic_year and self.academic_term:
            actual_academic_year = frappe.db.get_value(
                "Academic Term", self.academic_term, "academic_year"
            )
            if actual_academic_year != self.academic_year:
                frappe.throw(
                    _("Academic Term {0} does not belong to Academic Year {1}")
                    .format(self.academic_term, self.academic_year)
                )

    def validation_from_student_admission(self):
        student_admission = get_student_admission_data(
            self.student_admission, self.program
        )

        if (
            student_admission
            and student_admission.min_age
            and date_diff(
                nowdate(),
                add_years(getdate(self.date_of_birth), student_admission.min_age),
            )
            < 0
        ):
            frappe.throw(
                _("Not eligible for the admission in this program as per Date Of Birth")
            )

        if (
            student_admission
            and student_admission.max_age
            and date_diff(
                nowdate(),
                add_years(getdate(self.date_of_birth), student_admission.max_age),
            )
            > 0
        ):
            frappe.throw(
                _("Not eligible for the admission in this program as per Date Of Birth")
            )

    # --------------------------------------------------
    # ✅ BUSINESS LOGIC (NO HOOK)
    # --------------------------------------------------
    def check_exam_score_and_update_status(self):
        """
        Reject applicant if entrance score < 70
        Handles string values safely (eg: "63")
        """

        try:
            score = float(self.entrance_exam_score)
        except (ValueError, TypeError):
            return

        if self.application_status == "Applied" and score < 70:
            self.application_status = "Rejected"
            # self.send_rejection_email()

    # --------------------------------------------------
    # EMAIL
    # --------------------------------------------------
#     def send_rejection_email(self):

#         # NOTE: In your data field is student_email_id
#         email = self.student_email_id or self.email_id
#         if not email:
#             return

#         subject = _("Application Status – Admission Update")

#         message = f"""
# Dear {self.first_name},

# Thank you for applying for admission.

# After evaluating your entrance exam score ({self.entrance_exam_score}),
# we regret to inform you that your application has been rejected as it
# did not meet the minimum eligibility criteria.

# We wish you the very best for your future.

# Regards,
# Admissions Team
# """

#         frappe.sendmail(
#             recipients=[email],
#             subject=subject,
#             message=message,
#             sender='nishanthclintona@gmail.com',
#             now=True,
#         )

    # --------------------------------------------------
    # PAYMENT CALLBACK
    # --------------------------------------------------
    def on_payment_authorized(self, *args, **kwargs):
        self.db_set("paid", 1)


# --------------------------------------------------
# HELPER
# --------------------------------------------------
def get_student_admission_data(student_admission, program):
    admission_programs = frappe.get_all(
        "Student Admission Program",
        filters={
            "parenttype": "Student Admission",
            "parent": student_admission,
            "program": program,
        },
        fields=["applicant_naming_series", "min_age", "max_age"],
    )

    if admission_programs:
        return admission_programs[0]
    return None
