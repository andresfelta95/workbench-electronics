# Bibliography

Sources for the whole course (modules 00–11), grouped by type and mapped to
the modules they support. Each entry was checked on 2026-10-01 against the
publisher, the issuing organisation, Crossref, or a library or bookseller
catalogue that shows the ISBN. Anything that could not be confirmed is listed
in §8, not here.

This file is hand-written for now. ROADMAP §6 expects it to be generated
from `content/bibliography.yaml` once Phase A5 exists. The ids in the first
column are proposed keys for that file.

**Interim rule (until A5).** Lessons cannot carry `references:` yet. Until
they can, every quantitative claim a lesson makes about a real device has an
entry here whose Modules column names the lesson and the figure, as
`.claude/skills/course-writing/SKILL.md` §4 requires. These entries move into
the lessons' `references:` when A5 lands. The entries for lessons 00-01 to
00-04 were added and checked on 2026-10-02.

**Entry format:** Author(s). *Title*. Edition. Publisher, year. Identifier.
**Modules:** two-digit module numbers, or a lesson id with the figure it
supports, e.g. `00-04 (12.6 V resting)`. **ES** marks a Spanish-language
edition.

---

## 1. Textbooks

| Id | Entry | Modules |
|---|---|---|
| `horowitz-hill-2015` | Horowitz, P.; Hill, W. *The Art of Electronics*. 3rd ed. Cambridge University Press, 2015. ISBN 978-0-521-80926-9. | 00–11 (the general reference) |
| `scherz-monk-2016` | Scherz, P.; Monk, S. *Practical Electronics for Inventors*. 4th ed. McGraw-Hill Education (TAB), 2016. ISBN 978-1-259-58754-2. | 00, 01, 03, 06, 07, 09, 10 |
| `floyd-buchla-2019` | Floyd, T. L.; Buchla, D. M. *Principles of Electric Circuits: Conventional Current Version*. 10th ed. Pearson, 2019. ISBN 978-0-13-487948-2. | 00, 01, 02 |
| `agarwal-lang-2005` | Agarwal, A.; Lang, J. H. *Foundations of Analog and Digital Electronic Circuits*. Morgan Kaufmann (Elsevier), 2005. ISBN 978-1-55860-735-4. | 00, 02, 03, 06 |
| `sedra-smith-2020` | Sedra, A. S.; Smith, K. C.; Chan Carusone, T.; Gaudet, V. *Microelectronic Circuits*. 8th ed. Oxford University Press, 2020 (released Nov. 2019). ISBN 978-0-19-085346-4. | 03, 04 |
| `franco-2015` | Franco, S. *Design with Operational Amplifiers and Analog Integrated Circuits*. 4th ed. McGraw-Hill Education, 2015 (©; on sale Jan. 2014). ISBN 978-0-07-802816-8. | 04, 08, 10 |
| `carter-mancini-2017` | Carter, B.; Mancini, R. *Op Amps for Everyone*. 5th ed. Newnes (Elsevier), 2017. ISBN 978-0-12-811648-7. | 04, 08, 10 |
| `jung-2005` | Jung, W. (ed.), with the staff of Analog Devices. *Op Amp Applications Handbook*. Newnes (Elsevier), 2005. ISBN 978-0-7506-7844-5. | 04, 08, 10 |
| `erickson-maksimovic-2020` | Erickson, R. W.; Maksimović, D. *Fundamentals of Power Electronics*. 3rd ed. Springer, 2020. ISBN 978-3-030-43879-1. DOI 10.1007/978-3-030-43881-4. | 05, 08 (class D), 09 |
| `wurth-trilogy-2018` | Brander, T.; Gerfer, A.; Rall, B.; Zenkner, H. *Trilogy of Magnetics: Design Guide for EMI Filter Design, SMPS & RF Circuits*. 5th ed. Würth Elektronik eiSos, 2018. ISBN 978-3-89929-157-5. | 01 (inductors), 05, 11 |
| `self-2020` | Self, D. *Small Signal Audio Design*. 3rd ed. Focal Press (Routledge), 2020. ISBN 978-0-367-46895-8 (pbk), 978-0-367-46896-5 (hbk). | 08 |
| `hughes-drury-2019` | Hughes, A.; Drury, B. *Electric Motors and Drives: Fundamentals, Types and Applications*. 5th ed. Newnes (Elsevier), 2019. ISBN 978-0-08-102615-1. | 09 |
| `ott-2009` | Ott, H. W. *Electromagnetic Compatibility Engineering*. John Wiley & Sons, 2009. ISBN 978-0-470-18930-6. | 08 (grounding, hum), 11 |
| `bogatin-2018` | Bogatin, E. *Signal and Power Integrity — Simplified*. 3rd ed. Pearson (Prentice Hall), 2018. ISBN 978-0-13-451341-6. | 11 |
| `wadell-1991` | Wadell, B. C. *Transmission Line Design Handbook*. Artech House, 1991. ISBN 978-0-89006-436-8. | 11 (controlled impedance) |

## 2. Application notes, tutorials and papers

| Id | Entry | Modules |
|---|---|---|
| `fortunato-5527` | Fortunato, M. "Temperature and Voltage Variation of Ceramic Capacitors, or Why Your 4.7µF Capacitor Becomes a 0.33µF Capacitor." Maxim Integrated Tutorial 5527, 2012; now hosted by Analog Devices. https://www.analog.com/en/resources/technical-articles/temperature-and-voltage-variation-ceramic-capacitor.html | 01 (MLCC DC bias), 05, 11 |
| `ti-slva477` | Texas Instruments. "Basic Calculation of a Buck Converter's Power Stage." Application Report SLVA477. https://www.ti.com/lit/pdf/slva477 | 05 |
| `ti-slva372` | Texas Instruments. "Basic Calculation of a Boost Converter's Power Stage." Application Report SLVA372. https://www.ti.com/lit/pdf/slva372 | 05 |
| `ti-spra953` | Texas Instruments. "Semiconductor and IC Package Thermal Metrics." Application Note SPRA953. https://www.ti.com/lit/pdf/spra953 | 00 (thermal resistance), 03, 05 |
| `ti-slua618` | Balogh, L. "Fundamentals of MOSFET and IGBT Gate Driver Circuits." Texas Instruments SLUA618A, 2017, rev. 2018. https://www.ti.com/lit/pdf/slua618 | 03 (switching losses), 05, 09 |
| `nexperia-an10441` | NXP / Nexperia. "Level shifting techniques in I²C-bus design." AN10441, Rev. 2, 10 Feb. 2020. https://assets.nexperia.com/documents/application-note/AN10441.pdf | 06 (level shifting), 07 |
| `ti-slva689` | Arora, R. "I2C Bus Pullup Resistor Calculation." Texas Instruments SLVA689, Feb. 2015. https://www.ti.com/lit/pdf/slva689 | 06 (pull-ups), 07 (I²C) |
| `ganssle-debounce` | Ganssle, J. G. "A Guide to Debouncing." The Ganssle Group, 2004, rev. 2008. https://www.ganssle.com/debouncing.htm | 06 |
| `adi-mt002` | Kester, W. "What the Nyquist Criterion Means to Your Sampled Data System Design." Analog Devices Tutorial MT-002. https://www.analog.com/media/en/training-seminars/tutorials/MT-002.pdf | 06 (ADC, aliasing), 10 |
| `dhaker-2018` | Dhaker, P. "Introduction to SPI Interface." *Analog Dialogue* 52-09, Analog Devices, Sept. 2018. https://www.analog.com/en/resources/analog-dialogue/articles/introduction-to-spi-interface.html | 07 |
| `tek-xyz` | Tektronix. *XYZs of Oscilloscopes* (primer). https://www.tek.com/en/documents/primer/xyzs-oscilloscopes-primer | 02, 07 (oscilloscope) |
| `fluke-abc-safety` | Fluke Corporation. "ABCs of multimeter safety" (application note; IEC 61010 measurement categories). https://media.fluke.com/51012112-8f43-4aa7-a30a-b2e3016e8f2f_original%20file.pdf | 00 (multimeter, 00-05), safety callouts |
| `ti-sloa119` | Texas Instruments. "Class-D LC Filter Design." Application Report SLOA119, 2006, rev. 2008. https://www.ti.com/lit/pdf/sloa119 | 08 (class D) |
| `whitlock-an004` | Whitlock, B. "Hum & Buzz in Unbalanced Interconnect Systems." Jensen Transformers Application Note AN-004. https://www.jensen-transformers.com/wp-content/uploads/2014/08/an004.pdf | 08 (hum, ground loops) |
| `kitchin-counts-2006` | Kitchin, C.; Counts, L. *A Designer's Guide to Instrumentation Amplifiers*. 3rd ed. Analog Devices, 2006. https://www.analog.com/media/en/training-seminars/design-handbooks/designers-guide-instrument-amps-TOC-bib.pdf | 10 (in-amps, bridges) |
| `yuasa-powersports-manual` | Yuasa Battery, Inc. *Technical Manual: Powersports Batteries*. Undated (file published 2017). https://www.yuasabatteries.com/wp-content/uploads/2017/07/TechManual.x78244.pdf | 00-03, 00-04 (12 V lead-acid: a fully charged conventional battery rests at 12.6 V, 11.8 V or less at rest is 0 %, "fully discharged" at 10.5 V in a capacity test; a working charging system holds 13.0–14.5 V, AGM batteries need 14.0–14.8 V, Yuasa's charger peaks at 14.4 V) |
| `ti-slay054` | Texas Instruments. "Temperature Sensing with Thermistors" (Rev. A). SLAY054. https://www.ti.com/lit/pdf/slay054 | 10 (thermistors), 00-03 cross-link |
| `steinhart-hart-1968` | Steinhart, J. S.; Hart, S. R. "Calibration curves for thermistors." *Deep Sea Research and Oceanographic Abstracts* 15 (4): 497–503, 1968. DOI 10.1016/0011-7471(68)90057-0. | 10 |

## 3. Standards and specifications

| Id | Entry | Modules |
|---|---|---|
| `iec-60063-2015` | IEC. *IEC 60063:2015, Preferred number series for resistors and capacitors*. Ed. 3.0, 2015. | 01 (E-series), 00 (E24 in `Control`) |
| `ipc-2152` | IPC. *IPC-2152, Standard for Determining Current Carrying Capacity in Printed Board Design*. 2009. | 11 (trace width). See REVIEW m-06 on licensing. |
| `ipc-2221b` | IPC. *IPC-2221B, Generic Standard on Printed Board Design*. 2012. Superseded by IPC-2221C (2023). | 11 |
| `nxp-um10204` | NXP Semiconductors. *UM10204, I²C-bus specification and user manual*. Rev. 7.0, 1 Oct. 2021. https://www.nxp.com/docs/en/user-guide/UM10204.pdf | 06, 07 |
| `usb-if-usb2` | USB Implementers Forum. *Universal Serial Bus Specification*. Revision 2.0, 27 Apr. 2000 (USB-IF document library package dated 3 June 2025). https://www.usb.org/document-library/usb-20-specification | 00-01 (a USB port gives 5 V), 00-04 (bus-powered hub: the current in the upstream cable feeds the hub and its ports, §7.2.1) |
| `ucamco-gerber` | Ucamco. *The Gerber Layer Format Specification*. Revision 2026.05 (19 May 2026); previous revision 2024.05. https://www.ucamco.com/en/gerber/downloads | 11 (fab files) |

## 4. Datasheets and product manuals

| Id | Entry | Modules |
|---|---|---|
| `ti-ne555` | Texas Instruments. *xx555 Precision Timers* (NA555, NE555, SA555, SE555). Datasheet SLFS022. https://www.ti.com/lit/ds/symlink/ne555.pdf | 04 (555) |
| `microchip-atmega328p` | Microchip Technology. *ATmega48A/PA/88A/PA/168A/PA/328/P Data Sheet*. DS40002061, 2018. https://www.microchip.com/en-us/product/atmega328p | 00-03 (ADC source impedance, REVIEW m-08), 06, 10 |
| `yageo-cfr` | YAGEO Corporation. *Carbon Film Resistors, General Purpose, CFR Series* (through-hole). Product specification V.3, 3 Apr. 2024. https://www.yageogroup.com/content/Resource%20Library/Datasheet/YAGEO-CFR_DATASHEET.pdf | 00-01 (1/4 W through-hole: CFR-25 power rating 1/4 W at 70 °C, Table 1) |
| `yageo-rc-l` | YAGEO Corporation. *General Purpose Chip Resistors, RC_L series* (surface-mount, sizes 0075 to 2512). Product specification V.14, 14 Nov. 2025. https://yageogroup.com/content/datasheet/asset/file/PYU-RC_GROUP_51_ROHS_L | 00-01 (1/10 W surface-mount: RC0603 rated power 1/10 W at 70 °C; a high-power 0603 option is 1/5 W) |
| `kingbright-wp7113id` | Kingbright. *WP7113ID T-1 3/4 (5mm) Solid State Lamp* (high-efficiency red LED). Spec No. DSAF0012, Rev. V.14A, 2026. https://www.kingbrightusa.com/images/catalog/spec/wp7113id.pdf | 00-01, 00-04 (a red LED takes about 2 V: V_F 1.9 V typ., 2.3 V max. at 10 mA) |
| `fluke-11x-manual` | Fluke Corporation. *110/113/114/115/117 True-rms Multimeter Users Manual*. March 2020. https://media.fluke.com/5e1db354-3a6e-49cf-9edd-b10800c0e608_original%20file.pdf (the copy Fluke hosts is labelled Simplified Chinese; the specification tables are in English) | 00-02, 00-03 (a typical multimeter has 10 MΩ: Volts DC input impedance > 10 MΩ, < 100 pF, Table 7) |
| `fender-tm-twin-reverb` | Fender Musical Instruments Corporation. *Tone Master Twin Reverb Owner's Manual* (type PR 5184). https://www.fmicassets.com/Damroot/Original/10001/OM_22742XX000_Tone_Master_Twin_Reverb-Amp_USplus5.pdf | 00-03 (guitar amps have about 1 MΩ input impedance: Input 1 is 1 MΩ, Input 2 is 136 kΩ) |
| `energizer-alkaline-ais` | Energizer Brands, LLC. *Alkaline Manganese Dioxide-Zinc Batteries*, Article Information Sheet, document 0318-Alk, March 2018 (marked valid until March 2021; still the version Energizer serves on 2026-10-02). https://data.energizer.com/pdfs/alkaline_ais.pdf | 00-04 safety callout (alkaline cells are "not designed for recharging. Recharging can cause battery leakage or, in some cases, high pressure rupture"; do not mix with other battery types; replace all batteries at the same time) |

## 5. Online courses, references and tools

| Id | Entry | Modules |
|---|---|---|
| `kuphaldt-liec` | Kuphaldt, T. R. *Lessons in Electric Circuits*, vols. I–VI. Design Science License; maintained by All About Circuits. https://www.allaboutcircuits.com/textbook/ | 00–07 |
| `mit-6002-2007` | Agarwal, A.; Lang, J. *6.002 Circuits and Electronics*, Spring 2007. MIT OpenCourseWare. https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/ | 00, 02, 03, 06 |
| `bu-403` | Battery University (Cadex Electronics). "BU-403: Charging Lead Acid." Updated 8 Dec. 2023. https://www.batteryuniversity.com/article/bu-403-charging-lead-acid/ | 00-03, 00-04 (lead-acid charge limit 2.30–2.45 V per cell, 13.8–14.7 V for six cells; float 2.25–2.27 V per cell; 2.10 V per cell, 12.6 V, is about 90 % charged) |
| `kicad-9-docs` | KiCad Project. *KiCad 9.0 Documentation*: Schematic Editor, PCB Editor, Getting Started. https://docs.kicad.org/9.0/ | 11 |

## 6. Spanish-language resources

| Id | Entry | Modules |
|---|---|---|
| `boylestad-2017-es` | Boylestad, R. L. *Introducción al análisis de circuitos*. 13.ª ed. Pearson Educación, 2017. ISBN 978-607-32-4147-2. **ES** | 00, 01, 02 |
| `floyd-2007-es` | Floyd, T. L. *Principios de circuitos eléctricos*. 8.ª ed. Pearson Educación, 2007. ISBN 978-970-26-0967-4. **ES** (the ES counterpart of `floyd-buchla-2019`, two editions older) | 00, 01, 02 |
| `boylestad-nashelsky-2009-es` | Boylestad, R. L.; Nashelsky, L. *Electrónica: teoría de circuitos y dispositivos electrónicos*. 10.ª ed. Pearson Educación, 2009. ISBN 978-607-442-292-4. **ES** | 03, 04, 05 |
| `malvino-bates-2007-es` | Malvino, A. P.; Bates, D. J. *Principios de electrónica*. 7.ª ed. McGraw-Hill/Interamericana de España, 2007. ISBN 978-84-481-5619-0. **ES** | 03, 04, 05 |
| `sedra-smith-2006-es` | Sedra, A. S.; Smith, K. C. *Circuitos microelectrónicos*. 5.ª ed. McGraw-Hill Interamericana, 2006. ISBN 978-970-10-5472-7. **ES** (an older edition than `sedra-smith-2020`) | 03, 04 |
| `franco-2005-es` | Franco, S. *Diseño con amplificadores operacionales y circuitos integrados analógicos*. 3.ª ed. McGraw-Hill, 2005. ISBN 978-970-10-4595-4. **ES** (translation of the 3rd English ed.) | 04, 08, 10 |
| `openstax-fisica-u2-es` | OpenStax. *Física universitaria, volumen 2* (Spanish edition; free, openly licensed). Ch. 9 (current and resistance), 10 (DC circuits, Kirchhoff's rules, RC circuits), 14 (inductance), 15 (AC circuits). https://openstax.org/books/física-universitaria-volumen-2 | 00, 01, 02 |
| `hyperphysics-es` | Nave, C. R. *HyperPhysics* (Spanish version), Georgia State University. https://hyperphysics.gsu.edu/hbasees/electric/ohmlaw.html | 00, 02 |
| `phet-cck-es` | PhET Interactive Simulations, University of Colorado Boulder. *Kit de Construcción de Circuitos: CD* and *CA* (Spanish). https://phet.colorado.edu/es/simulations/circuit-construction-kit-dc | 00, 02 |

---

## 7. Module map

The best sources per module. **Bold** marks the primary text for the
module. Italic marks a Spanish-language source.

| Module | Sources |
|---|---|
| 00 Fundamentals | **horowitz-hill-2015** ch. 1; scherz-monk-2016; floyd-buchla-2019; agarwal-lang-2005; kuphaldt-liec vol. I; mit-6002-2007; ti-spra953 (thermal resistance for 00-06); fluke-abc-safety (00-05 multimeter); microchip-atmega328p (divider into an ADC); device figures in 00-01 to 00-04: yageo-cfr, yageo-rc-l, kingbright-wp7113id, usb-if-usb2, fluke-11x-manual, fender-tm-twin-reverb, yuasa-powersports-manual, bu-403, energizer-alkaline-ais; *boylestad-2017-es*; *floyd-2007-es*; *openstax-fisica-u2-es*; *hyperphysics-es*; *phet-cck-es* |
| 01 Passives | **horowitz-hill-2015** ch. 1 and appendices; fortunato-5527; iec-60063-2015; wurth-trilogy-2018; scherz-monk-2016; *boylestad-2017-es* |
| 02 Time and frequency | **horowitz-hill-2015** ch. 1; floyd-buchla-2019; agarwal-lang-2005; tek-xyz; kuphaldt-liec vol. II; *openstax-fisica-u2-es* ch. 10, 14, 15; *boylestad-2017-es*; *phet-cck-es* (AC) |
| 03 Semiconductors | **sedra-smith-2020**; horowitz-hill-2015 ch. 2, 3, 9; ti-slua618; ti-spra953; *boylestad-nashelsky-2009-es*; *malvino-bates-2007-es*; *sedra-smith-2006-es* |
| 04 Analog ICs | **franco-2015**; carter-mancini-2017; jung-2005; horowitz-hill-2015 ch. 4, 7; ti-ne555; *franco-2005-es*; *malvino-bates-2007-es* |
| 05 Power | **erickson-maksimovic-2020**; horowitz-hill-2015 ch. 9; ti-slva477; ti-slva372; ti-spra953; wurth-trilogy-2018; *boylestad-nashelsky-2009-es* |
| 06 Digital | **horowitz-hill-2015** ch. 10, 12, 13; nexperia-an10441; ti-slva689; ganssle-debounce; adi-mt002; microchip-atmega328p; kuphaldt-liec vol. IV |
| 07 Buses and instruments | **nxp-um10204**; dhaker-2018; ti-slva689; tek-xyz (07-04 probing); horowitz-hill-2015 ch. 14 |
| 08 Sound | **self-2020**; ti-sloa119; whitlock-an004; ott-2009 (grounding); franco-2015 (active filters); carter-mancini-2017 |
| 09 Motors | **hughes-drury-2019**; ti-slua618; erickson-maksimovic-2020; scherz-monk-2016; horowitz-hill-2015 ch. 9 |
| 10 Sensors | **kitchin-counts-2006**; ti-slay054; steinhart-hart-1968; jung-2005 (sensor signal conditioning); horowitz-hill-2015 ch. 5, 8 (precision, noise); adi-mt002; *franco-2005-es* |
| 11 PCB | **bogatin-2018**; ott-2009; ipc-2152; ipc-2221b; wadell-1991; ucamco-gerber; kicad-9-docs; wurth-trilogy-2018 (EMI filtering) |

Chapter numbers for *The Art of Electronics* refer to the 3rd edition's
chapter titles. Check them when citing a specific claim.

---

## 8. Unverified or excluded

Not used in the tables above. Each needs a check before it is cited.

| Candidate | Status |
|---|---|
| Mancini, R. (ed.), *Op Amps for Everyone*, Texas Instruments SLOD006B (free PDF) | The TI lit URLs (`/lit/pdf/slod006`, `/slod006b`) returned 404 on 2026-10-01. Copies exist only on third-party mirrors. Cite the Newnes 5th edition (`carter-mancini-2017`) instead. |
| Sedra & Smith, 9th English edition | No evidence it exists. The 8th (2020) is the latest found. |
| Spanish editions of Scherz & Monk, Horowitz & Hill, Bogatin, Ott, Self, Erickson & Maksimović | None found. Booksellers list only the English editions. The search was not exhaustive. |
| KiCad documentation in Spanish | `docs.kicad.org/9.0/es/…` serves English text, with only a translator credit. It is not a translation. |
| MIT OCW 6.002 Spanish translation (Universia) | Linked from the OCW course page. The target was not checked. |
| Spanish university OpenCourseWare (UC3M, UPV, Universidad de Sevilla) | The portals exist. No specific electronics course was confirmed. |
| Vishay Micro-Measurements tech notes on strain gauges and bridge nonlinearity (e.g. TN-507) | Not checked. Module 10-02 needs a strain-gauge source. |
| A TI electret-microphone preamp reference design | Not checked. Module 08-01 needs an electret bias source. |
| An optocoupler CTR application note (Vishay, Broadcom or onsemi) | Not checked. Module 09-07 needs one. |
| A stepper or servo driver application note | Not checked. Modules 09-05 and 09-06 rely on `hughes-drury-2019` only. |
| IPC-2141 (controlled impedance) and IPC-2221C (2023) | Existence noted. Edition details were not checked. |
| IEC 61010-1 current edition | Cited only indirectly, through `fluke-abc-safety`. |
| Murata, TDK or Samsung DC-bias curve tools, as a data source for `mlcc-derating` | Not checked, and the terms of use for reproducing their data are unknown. |
| Publication years of ADI MT-002 and TI SLAY054, SLVA477 and SLVA372 | The documents were confirmed but their years were not, so years are left out above. |
