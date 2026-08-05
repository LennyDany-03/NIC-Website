"use client";

import { motion } from "framer-motion";
import { SelectField, TextField } from "./fields";
import { CLASS_OPTIONS, CLASS_OTHER, SECTION_OPTIONS, YEAR_OPTIONS } from "./content";
import { seatRow } from "../../motionPresets";

/**
 * Step 1 — the six things the register is kept by.
 *
 * Two columns from `sm` up and one on a phone, in the order the poster's own
 * paperwork asks for them: who, which class, which section, how to reach you,
 * which number, which year. Name and email each take the full width because a
 * name in a half-column wraps and an email address in one is unreadable at the
 * exact moment it needs checking.
 *
 * The "Other" box is rendered conditionally rather than disabled. A permanently
 * present field that is dead five times out of six is six people reading a
 * question that was not for them; and because it is only mounted when it is
 * required, `validateDetails` can require it without any special case.
 */
export default function StepDetails({ values, errors, setField }) {
  const other = values.stream === CLASS_OTHER;

  return (
    <motion.div variants={seatRow} className="grid gap-5 sm:grid-cols-2 sm:gap-6">
      <div className="sm:col-span-2">
        <TextField
          id="name"
          label="Name"
          value={values.name}
          onChange={setField}
          error={errors.name}
          placeholder="As it appears on your ID card"
          autoComplete="name"
        />
      </div>

      <SelectField
        id="stream"
        label="Class"
        value={values.stream}
        onChange={setField}
        options={CLASS_OPTIONS}
        error={errors.stream}
      />

      <SelectField
        id="section"
        label="Section"
        value={values.section}
        onChange={setField}
        options={SECTION_OPTIONS}
        error={errors.section}
        placeholder="A – D"
      />

      {other ? (
        <div className="sm:col-span-2">
          <TextField
            id="streamOther"
            label="Which class"
            value={values.streamOther}
            onChange={setField}
            error={errors.streamOther}
            placeholder="Department and specialisation"
            autoComplete="off"
            hint="The workshop is open past the department — say where you are from and we will put it on the register as written."
          />
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <TextField
          id="email"
          label="Email ID"
          type="email"
          value={values.email}
          onChange={setField}
          error={errors.email}
          placeholder="you@srmist.edu.in"
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <TextField
        id="registerNumber"
        label="Registration number"
        value={values.registerNumber}
        onChange={setField}
        /* Uppercased when the field is left rather than as it is typed: rewriting
           somebody's characters under the cursor moves the caret and is the sort
           of thing that makes a form feel possessed. */
        onBlur={(id, value) => setField(id, value.trim().toUpperCase())}
        error={errors.registerNumber}
        placeholder="RA…"
        autoComplete="off"
      />

      <SelectField
        id="year"
        label="Year"
        value={values.year}
        onChange={setField}
        options={YEAR_OPTIONS}
        error={errors.year}
      />
    </motion.div>
  );
}
