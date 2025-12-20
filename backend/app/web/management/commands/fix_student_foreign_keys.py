from django.core.management.base import BaseCommand
from django.db import IntegrityError, transaction

from users.models import Student
from web.models import Registration, RegistrationSubmission, Subscription


class Command(BaseCommand):
    help = (
        "Fix legacy rows where frontend sent Student.id instead of CustomUser.id "
        "for user foreign keys (subscriptions/registrations)."
    )

    def handle(self, *args, **options):
        student_by_id = {
            student.id: student.user_id
            for student in Student.objects.only("id", "user_id")
        }

        def fix_subscriptions():
            updated = 0
            merged = 0
            errors = 0

            qs = Subscription.objects.all().only(
                "id", "user_id", "club_id", "notifications_enabled"
            )
            for sub in qs.iterator():
                old_user_id = sub.user_id
                new_user_id = student_by_id.get(old_user_id)
                if not new_user_id or new_user_id == old_user_id:
                    continue

                try:
                    with transaction.atomic():
                        existing = (
                            Subscription.objects.filter(
                                user_id=new_user_id, club_id=sub.club_id
                            )
                            .exclude(id=sub.id)
                            .only("id", "notifications_enabled")
                            .first()
                        )
                        if existing:
                            if sub.notifications_enabled and not existing.notifications_enabled:
                                Subscription.objects.filter(id=existing.id).update(
                                    notifications_enabled=True
                                )
                            Subscription.objects.filter(id=sub.id).delete()
                            merged += 1
                        else:
                            Subscription.objects.filter(id=sub.id).update(
                                user_id=new_user_id
                            )
                            updated += 1
                except IntegrityError:
                    errors += 1

            return updated, merged, errors

        def fix_registration_submissions():
            updated = 0
            errors = 0

            qs = RegistrationSubmission.objects.all().only("id", "user_id")
            for obj in qs.iterator():
                old_user_id = obj.user_id
                new_user_id = student_by_id.get(old_user_id)
                if not new_user_id or new_user_id == old_user_id:
                    continue
                try:
                    RegistrationSubmission.objects.filter(id=obj.id).update(
                        user_id=new_user_id
                    )
                    updated += 1
                except IntegrityError:
                    errors += 1

            return updated, errors

        def fix_registrations():
            updated = 0
            merged = 0
            errors = 0

            qs = Registration.objects.all().only("id", "user_id", "form_id", "data_json")
            for reg in qs.iterator():
                old_user_id = reg.user_id
                new_user_id = student_by_id.get(old_user_id)
                if not new_user_id or new_user_id == old_user_id:
                    continue

                try:
                    with transaction.atomic():
                        existing = (
                            Registration.objects.filter(
                                user_id=new_user_id, form_id=reg.form_id
                            )
                            .exclude(id=reg.id)
                            .only("id", "data_json")
                            .first()
                        )
                        if existing:
                            if isinstance(existing.data_json, dict) and isinstance(
                                reg.data_json, dict
                            ):
                                merged_json = dict(reg.data_json)
                                merged_json.update(existing.data_json)
                                if merged_json != existing.data_json:
                                    Registration.objects.filter(id=existing.id).update(
                                        data_json=merged_json
                                    )
                            Registration.objects.filter(id=reg.id).delete()
                            merged += 1
                        else:
                            Registration.objects.filter(id=reg.id).update(
                                user_id=new_user_id
                            )
                            updated += 1
                except IntegrityError:
                    errors += 1

            return updated, merged, errors

        subs_updated, subs_merged, subs_errors = fix_subscriptions()
        submissions_updated, submissions_errors = fix_registration_submissions()
        registrations_updated, registrations_merged, registrations_errors = fix_registrations()

        self.stdout.write(self.style.SUCCESS("Done."))
        self.stdout.write(
            f"Subscriptions updated: {subs_updated}, merged: {subs_merged}, errors: {subs_errors}"
        )
        self.stdout.write(
            f"RegistrationSubmissions updated: {submissions_updated}, errors: {submissions_errors}"
        )
        self.stdout.write(
            f"Registrations updated: {registrations_updated}, merged: {registrations_merged}, errors: {registrations_errors}"
        )
