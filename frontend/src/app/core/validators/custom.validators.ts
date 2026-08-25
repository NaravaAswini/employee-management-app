import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Email Validator enforcing:
   * 1. Exactly one '@' symbol separating local name and domain.
   * 2. No whitespace characters anywhere.
   * 3. Total length <= 320 characters.
   * 4. Valid domain and local parts.
   */
  static strictEmail(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // let Validators.required handle empty

    if (typeof value !== 'string') return { invalidEmail: true };

    // Rule 1: No spaces
    if (/\s/.test(value)) {
      return { noSpaces: 'Whitespace characters are completely forbidden anywhere in the email.' };
    }

    // Rule 2: Max length 320 characters
    if (value.length > 320) {
      return { maxLength320: 'Email address cannot exceed 320 characters in total.' };
    }

    // Rule 3: Single '@' symbol
    const parts = value.split('@');
    if (parts.length !== 2) {
      return { singleAtSymbol: 'Email must contain exactly one "@" symbol separating the local name and domain.' };
    }

    const [local, domain] = parts;
    if (!local || local.length === 0) {
      return { emptyLocal: 'Email username before "@" cannot be empty.' };
    }

    if (!domain || domain.length === 0 || !domain.includes('.')) {
      return { invalidDomain: 'Email domain after "@" must contain a valid domain extension (e.g. .com).' };
    }

    // Standard pattern check
    const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailPattern.test(value)) {
      return { invalidFormat: 'Please enter a valid email format.' };
    }

    return null;
  }

  /**
   * Password Validator enforcing:
   * 1. Minimum 8 characters.
   * 2. At least one uppercase letter (A-Z).
   * 3. At least one lowercase letter (a-z).
   * 4. At least one numeric digit (0-9).
   * 5. At least one special symbol (@, $, !, %, &, etc.).
   */
  static strictPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // let Validators.required handle empty

    const errors: ValidationErrors = {};

    if (value.length < 8) {
      errors['minLength'] = 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(value)) {
      errors['noUppercase'] = 'Password must contain at least one uppercase letter (A-Z).';
    }
    if (!/[a-z]/.test(value)) {
      errors['noLowercase'] = 'Password must contain at least one lowercase letter (a-z).';
    }
    if (!/[0-9]/.test(value)) {
      errors['noNumber'] = 'Password must contain at least one numeric digit (0-9).';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['noSpecial'] = 'Password must contain at least one special symbol (e.g. @, $, !, %, &, *).';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}
