export function formatDate(date: string) {
	// new Intl.DateTimeFormat() new Date(date)

	return <time dateTime={date}>{date}</time>;
}
