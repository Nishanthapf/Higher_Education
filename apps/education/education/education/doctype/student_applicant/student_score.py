import frappe
from frappe import _
from frappe.utils import nowdate


def update_application_status(doc, method=None):
    """
    Trigger this on on_update or validate hook
    """

    # -------------------------------------
    # Skip during data import
    # -------------------------------------
    if getattr(frappe.flags, "in_import", False):
        return

    # -------------------------------------
    # Conditions
    # -------------------------------------
    if (
        doc.application_status == "Applied"
        and doc.entrance_exam_score is not None
        and doc.entrance_exam_score < 70
    ):
        # -------------------------------------
        # Update Status
        # -------------------------------------
        doc.application_status = "Rejected"

        # -------------------------------------
        # Send Rejection Email
        # -------------------------------------
        send_rejection_email(doc)


def send_rejection_email(doc):
    """
    Sends rejection mail to applicant
    """

    if not doc.email_id:
        return

    subject = _("Application Status – Admission Update")

    message = f"""
    Dear {doc.first_name},

    Thank you for applying for admission.

    After evaluating your entrance examination score,
    we regret to inform you that your application has been rejected
    as the score did not meet the minimum eligibility criteria.

    Entrance Exam Score: {doc.entrance_exam_score}

    We wish you the very best for your future endeavors.

    Regards,
    Admissions Team
    """

    frappe.sendmail(
        recipients=[doc.email_id],
        subject=subject,
        message=message,
    )
