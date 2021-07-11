import { getLookupContainerFromHeaderText } from './shared';
import { debounce } from 'debounce';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

function notesClickEventListener(period: string, modal: HTMLElement, array: HTMLElement[]) {
	const modalTitle = modal.querySelector<HTMLHeadingElement>('h4');
	if (modalTitle === null) return;

	const modalList = modal.querySelector<HTMLDivElement>('div.sp-widget__list');
	if (modalList === null) return;

	modalTitle.textContent = `Noter - ${period}`;

	while (modalList.lastElementChild) {
		modalList.removeChild(modalList.lastElementChild);
	}

	for (const element of array) {
		modalList.appendChild(element.cloneNode(true));
	}
}

function notesCreate(notes: HTMLElement[], modal: HTMLDivElement, tbody: HTMLTableSectionElement) {
	//Reset table body
	tbody.innerHTML = `<tr class='row-sxplus'>
		<th>Antal</th>
	</tr>`;

	const allNotes: HTMLElement[] = [];
	const monthNotes: HTMLElement[] = [];
	const weekNotes: HTMLElement[] = [];
	const dayNotes: HTMLElement[] = [];

	for (const element of notes) {
		const noteTime = element.querySelector<HTMLDivElement>('.sp-widget__date')?.textContent?.substring(2);
		if (noteTime === undefined) continue;

		const noteText = element.querySelector<HTMLDivElement>('.sp-widget__text')?.textContent;
		if (noteText === null || noteText === undefined) continue;

		const now = dayjs();
		const date = dayjs(noteTime, 'DD-MM-YY HH:mm');

		allNotes.push(element);

		if (date.diff(now, 'day') == 0) {
			dayNotes.push(element);
			weekNotes.push(element);
			monthNotes.push(element);
		} else if (date.diff(now, 'week') == 0) {
			weekNotes.push(element);
			monthNotes.push(element);
		} else if (date.diff(now, 'month') == 0) {
			monthNotes.push(element);
		}
	}

	if (allNotes.length > 0) {
		const td = document.createElement('td');

		const a = document.createElement('a');
		a.setAttribute('data-toggle', 'modal');
		a.setAttribute('data-target', '#modal-notes-sxplus');
		a.style.setProperty('color', 'inherit');
		a.style.setProperty('text-decoration', 'underline');
		a.textContent = allNotes.length.toString();
		a.addEventListener('click', () => {
			notesClickEventListener('Altid', modal, allNotes);
		});

		td.appendChild(a);
		tbody.children[0].appendChild(td);
	} else {
		const td = document.createElement('td');
		td.textContent = '0';
		tbody.children[0].appendChild(td);
	}

	if (monthNotes.length > 0) {
		const td = document.createElement('td');

		const a = document.createElement('a');
		a.setAttribute('data-toggle', 'modal');
		a.setAttribute('data-target', '#modal-notes-sxplus');
		a.style.setProperty('color', 'inherit');
		a.style.setProperty('text-decoration', 'underline');
		a.textContent = monthNotes.length.toString();
		a.addEventListener('click', () => {
			notesClickEventListener('Seneste måned', modal, monthNotes);
		});

		td.appendChild(a);
		tbody.children[0].appendChild(td);
	} else {
		const td = document.createElement('td');
		td.textContent = '0';
		tbody.children[0].appendChild(td);
	}

	if (weekNotes.length > 0) {
		const td = document.createElement('td');

		const a = document.createElement('a');
		a.setAttribute('data-toggle', 'modal');
		a.setAttribute('data-target', '#modal-notes-sxplus');
		a.style.setProperty('color', 'inherit');
		a.style.setProperty('text-decoration', 'underline');
		a.textContent = weekNotes.length.toString();
		a.addEventListener('click', () => {
			notesClickEventListener('Seneste uge', modal, weekNotes);
		});

		td.appendChild(a);
		tbody.children[0].appendChild(td);
	} else {
		const td = document.createElement('td');
		td.textContent = '0';
		tbody.children[0].appendChild(td);
	}

	if (dayNotes.length > 0) {
		const td = document.createElement('td');

		const a = document.createElement('a');
		a.setAttribute('data-toggle', 'modal');
		a.setAttribute('data-target', '#modal-notes-sxplus');
		a.style.setProperty('color', 'inherit');
		a.style.setProperty('text-decoration', 'underline');
		a.textContent = dayNotes.length.toString();
		a.addEventListener('click', () => {
			notesClickEventListener('Seneste døgn', modal, dayNotes);
		});

		td.appendChild(a);
		tbody.children[0].appendChild(td);
	} else {
		const td = document.createElement('td');
		td.textContent = '0';
		tbody.children[0].appendChild(td);
	}
}

export const execute = async () => {
	//Some fuckery was happening with the click event listeners when running the function immediately
	setTimeout(() => {
		const cont = document.querySelector('.template.template__controls');
		if (cont === null) return;

		const [notes, notesRow]: [HTMLDivElement[], HTMLDivElement] | [null, null] = getLookupContainerFromHeaderText(
			'Noter',
			(element) => {
				const container = element.closest('.row');
				if (container === null) return;

				const children = container.querySelectorAll<HTMLDivElement>('.sp-widget__list > *');

				const notes = Array.from(children);
				return [notes, container];
			},
			[null, null]
		);

		if (notes === null || notesRow === null) return;

		const modal = document.createElement('div');
		modal.className = 'modal fade';
		modal.id = 'modal-notes-sxplus';
		modal.style.setProperty('display', 'none');
		modal.innerHTML = `<div class='modal-dialog modal-lg' role='document'>
			<div class='modal-content'>
				<div class='modal-header'>
					<button type='button' data-dismiss='modal' aria-label='Close' class='close'><span aria-hidden='true'>×</span></button>
					<h4 class='modal-title' style='color:white;'></h4>
				</div>
				<div class='modal-body' style='color:white;font-size:15px;'>
					<div class='sp-widget'>
						<div class='scrollable'>
							<div class='sp-widget__cont'>
								<div class='sp-widget__list'>

								</div>
							</div>
						</div>
					</div>
				</div>
				<div class='modal-footer'>
					<button type='button' data-dismiss='modal' class='btn btn-default'>Luk</button>
				</div>
			</div>
		</div>`;

		cont.appendChild(modal);

		const container = document.createElement('div');
		container.className = 'row';
		container.innerHTML = `<div class='col-md-12 col-xs-11'>
			<div class='panel panel-danger'>
				<div class='panel-heading' style='background-color:#2980b9;border-bottom-color:white;'>
					<h3 class='panel-title'>Noteoverblik</h3>
				</div>

				<div class='panel-body'>
					<input class='form-control' type='text' placeholder='Filter..'>
					<div class='template__table_static template__table_responsive'>
						<div class='scrollable'>
							<table class='table table_sortable {sortlist: [[0,0]]}' cellspacing='0' width='100%'>
								<thead>
									<tr>
										<th></th>
										<th>Altid</th>
										<th>Seneste måned</th>
										<th>Seneste uge</th>
										<th>Seneste døgn</th>
									</tr>
								</thead>

								<tbody>
									
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>`;

		const filter = container.querySelector<HTMLInputElement>('input');
		if (filter === null) return;

		const tbody = container.querySelector<HTMLTableSectionElement>('tbody');
		if (tbody === null) return;

		cont.appendChild(container);
		notesRow.before(container);

		filter.addEventListener(
			'keyup',
			debounce(() => {
				const filterText = filter.value.toLowerCase();

				const filteredNotes = [];
				for (const note of notes) {
					const noteTextContent = note.textContent?.toLowerCase();

					if (noteTextContent && noteTextContent.includes(filterText)) {
						filteredNotes.push(note);

						break;
					}
				}

				notesCreate(filteredNotes, modal, tbody);
			}, 800)
		);

		notesCreate(notes, modal, tbody);
	});
};

execute();