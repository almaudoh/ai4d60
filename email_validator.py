"""Utilities for validating email addresses."""

from __future__ import annotations

import re


_LOCAL_PART_RE = re.compile(r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$")
_DOMAIN_LABEL_RE = re.compile(r"^[A-Za-z0-9-]+$")


def is_valid_email(email: str) -> bool:
    """Validate whether a string is a well-formed email address.

    This function performs pragmatic, application-level validation of email
    syntax. It is intentionally stricter than what the full RFC allows because
    many technically valid RFC forms (for example quoted local parts or domain
    literals) are uncommon in real-world sign-up forms and can introduce
    unnecessary complexity.

    Validation rules enforced:
    - Input must be a non-empty string containing exactly one ``@``.
    - The local part (before ``@``) may contain letters, digits, and common
      symbols (``!#$%&'*+/=?^_`{|}~.-``).
    - The local part cannot start/end with ``.`` and cannot contain ``..``.
    - The local part length must be at most 64 characters.
    - The domain (after ``@``) must contain at least one dot.
    - Each domain label must be 1-63 characters, contain only letters/digits
      or hyphens, and cannot start or end with a hyphen.
    - The full domain length must be at most 255 characters.
    - The top-level domain must contain only letters and be at least 2
      characters long.

    Args:
        email: Candidate email address to validate.

    Returns:
        ``True`` if ``email`` satisfies all validation checks, otherwise
        ``False``.
    """
    if not isinstance(email, str) or not email:
        return False

    if email.count("@") != 1:
        return False

    local_part, _, domain = email.rpartition("@")

    if not local_part or not domain:
        return False

    if len(local_part) > 64 or len(domain) > 255:
        return False

    if local_part.startswith(".") or local_part.endswith(".") or ".." in local_part:
        return False

    if not _LOCAL_PART_RE.fullmatch(local_part):
        return False

    labels = domain.split(".")
    if len(labels) < 2:
        return False

    for label in labels:
        if not label:
            return False
        if len(label) > 63:
            return False
        if label.startswith("-") or label.endswith("-"):
            return False
        if not _DOMAIN_LABEL_RE.fullmatch(label):
            return False

    tld = labels[-1]
    if len(tld) < 2 or not tld.isalpha():
        return False

    return True
