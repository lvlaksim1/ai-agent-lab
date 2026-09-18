# DEC-20260918-apfs-evidence-channel

Date: 2026-09-18
Status: ACTIVE
Type: OWNER DECISION

The owner authorized adding a diagnostic APFS evidence channel to the iOS-Research-Runtime Windows E2E and resuming production.

Operational consequence:
- clear the owner-decision block;
- enqueue the next production continuation;
- first persist compact source-vs-rebuilt NX/APFS/checkpoint structural evidence;
- identify the first causally incompatible metadata field;
- only then make the smallest justified APFS writer correction if supported by evidence.

Proof gates and the object Definition of Done remain unchanged. Speculative APFS writer changes remain prohibited.
