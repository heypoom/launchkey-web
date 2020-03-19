export function positionOf(note: number) {
  let position = note - 95
  if (position >= 17) position -= 7

  return position
}

export function noteOf(position: number) {
  let note = position + 95
  if (position > 9) note += 7

  return note
}
