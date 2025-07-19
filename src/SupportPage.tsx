import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom' // useRouteMatch

import { AutoSuggestQuestions } from 'categories/AutoSuggestQuestions';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { useGlobalContext, useGlobalState } from 'global/GlobalProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faPlus } from '@fortawesome/free-solid-svg-icons'
import QPlus from 'assets/QPlus.png';
import { IQuestionKey } from 'categories/types';
import useFetchWithMsal from 'hooks/useFetchWithMsal';
import { protectedResources } from 'authConfig';

type SupportParams = {
	source: string;
	tekst: string;
	email?: string;
};

const SupportPage: React.FC = () => {

	let { source, tekst/*, email*/ } = useParams<SupportParams>();
	let navigate = useNavigate();

	// TODO do we need this?
	// const globalState = useGlobalState();
	// const {isAuthenticated} = globalState;

	// if (!isAuthenticated)
	//     return <div>loading...</div>;

	const { searchQuestions } = useGlobalContext();
	const { canEdit, authUser, isDarkMode, variant, bg, categoryRows: cats, categoryRowsLoaded: catsLoaded } = useGlobalState();

	const onSelectQuestion = async (questionKey: IQuestionKey) => {
		navigate(`/categories/${questionKey.topId}_${questionKey.id}`)
	}

	// useEffect(() => {
	// 	(async () => {
	//if (isAuthenticated) {
	//await OpenDB();
	//}
	//await loadCats();
	// 	})()
	// }, []) // , isAuthenticated



	if (!catsLoaded)
		return null;

	return (
		<Container fluid>
			<Row className={`${isDarkMode ? "dark" : ""}`}>
				<Col>
					<div className="d-flex justify-content-start align-items-center">
						<div className="w-75 questions">
							<AutoSuggestQuestions
								tekst={tekst}
								onSelectQuestion={onSelectQuestion}
								categoryRows={cats}
								searchQuestions={searchQuestions}
							/>
						</div>
						<Button
							variant={variant}
							title="Store Question to Knowledge database"
							className="ms-2"
							onClick={() => {
								if (!canEdit) {
									alert('As the member of "Viewers", you have no permission to edit data');
									return false;
								}
								// redirect to categories
								localStorage.setItem('New_Question', JSON.stringify({
									source,
									title: tekst
								}))
								navigate('/categories/add_question')
							}}
						>
							{/* <FontAwesomeIcon icon={faPlus} size="sm" /> */}
							{/* <FontAwesomeIcon icon={faQuestion} size='sm' style={{ marginLeft: '-5px' }} /> */}
							<img width="24" height="20" src={QPlus} alt="Store Question To Database" />
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default SupportPage

