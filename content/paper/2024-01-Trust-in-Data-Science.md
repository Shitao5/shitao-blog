---
title: 'Trust in Data Science'
subtitle: 'Collaboration, Translation, and Accountability in Corporate Data Science Projects'
author: 吴诗涛
date: '2024-03-31'
---

> Samir Passi and Steven J. Jackson. 2018. Trust in Data Science: Collaboration, Translation, and Accountability in Corporate Data Science Projects. Proc. ACM Hum.-Comput. Interact. 2, CSCW, Article 136 (November 2018), 28 pages. <https://doi.org/10.1145/3274405>

# 论文概述

这篇论文主要探讨企业中数据科学项目的信任问题。作者 Samir Passi 参与 DeepNetwork 的数据科学项目，并担任了其中两个商业项目的首席数据科学家。此外，他开展田野调查，采访数据科学家、项目经理、产品经理、业务分析师以及公司高管，通过采访数据结合亲身经历作为论文的实践支撑。

论文发现，企业中数据科学项目中信任的建立是深度协作的成果，为在不确定的世界中务实地行动提供支持。文中提到了解决信任问题的主要机制：

1.  算法见证（algorithmic witnessing）：通过技术手段评估模型性能。
2.  责任审议（deliberative accountability）：通过多个领域专家的多个视角协作评估模型。

作者建议，未来的数据科学教育应包含协作、翻译等方面的内容，以便数据科学家更能有效地参与团队合作。

# 术语

-   CSCW：Computer-supported cooperative work，计算机支持的协同工作。研究人们如何利用技术朝着共同的目标努力。

# 论文内容

## Introduction

-   Researchers argue that "everything might be collected and connected, but that does not necessarily mean that everything can be known". Data are never "raw", often speaking specific forms of knowledge to power.

    > 研究人员认为"一切皆可被收集和连接并不意味着一切皆可知"。数据永远不是"原始"的，通常表达着对权力具体形式的认知。

    数据并不一定中立，难以做到对数据客观中立地解读。

-   The idea of data-led objective discoveries entirely discounts the role of interpretive frameworks in making sense of data which are a necessary and inevitable part of interacting with the world, people and phenomena.

    > 数据驱动客观发现的理念完全忽视了理解数据时解释性框架的作用，它们是世界、人类和现象互动时不可或缺的角色。

-   We describe how four common tensions in corporate data science work --- (un)equivocal numbers, (counter)intuitive knowledge, (in)credible data, and (in)scrutable models --- raise problems of trust, and show the practices of skepticism, assessment, and credibility by which organizational actors establish and re-negotiate trust under uncertain analytic conditions: work that is simultaneously calculative and collaborative. Highlighting the heterogeneous nature of real-world data science, we show how management and accountability of trust in applied data science work depends not only on preprocessing and quantification, but also on negotiation and translation -- producing forms of what we identify as "algorithmic witnessing" and "deliberative accountability". Trust in data science is therefore best understood as a deeply *collaborative* accomplishment, undertaken in the service of pragmatic ways of acting in an uncertain world.

    > 我们描述了企业数据科学工作中四种常见紧张关系------（不）明确的数字、（违反）直觉的知识、（不）可信的数据和（不）可解释的模型------如何引发信任问题，并展示了组织参与者在不确定的分析条件下建立和重新协商信任的怀疑、评估和可信度实践，这些实践同时具有计算性和协作性。通过突显实际数据科学的异质性，我们展示了在应用数据科学工作中信任的管理和责任不仅取决于预处理和量化，同时还取决于谈判和翻译，产生了我们称之为"算法见证"和"责任审议"的形式。因此，数据科学的信任最好被理解为一个深度协作的成果，旨在为在不确定的世界中采取务实的行动提供支持。

## Trust, Objectivity, and Justification

-   Early experimental science was thus a collective practice simultaneously social and technical: facts emerged through specific forms of sociability embedded within the experimental discourse.

    > 早期实验科学是一种同时具有社会性和技术性的集体实践：事实是通过嵌入实验话语中的特定形式的社交性而出现的。

-   As the work of interpretation shifted from the maker to the reader, scientific artifacts became open to interpretation, making consensus challenging. Agreements between multiple ways of seeing required differentiating between right and wrong interpretations: science required the correct "professional vision". As mathematicians and physicists argued for "structural objectivity" characterized by forms of measurement and replicability, the role of "trained judgments" became salient. Scientists thus chased truth with "calibrated eyes" and standardized tool, simultaneously questioning the credibility of their findings, instruments, and knowledge.

    > 随着解释的工作从制作者转移到读者，科学开始开放解释，达成共识变得具有挑战性。多种视角之间达成一致需要区分正确和错误的解释：科学需要正确的"专业视野"。随着数学家和物理学家主张以测量形式和可重复性为特征的"结构客观性"，"训练有素的判断"的作用变得突出。因此，科学家们通过"校准的眼睛"和标准化工具追求真理，同时质疑他们的发现、仪器和知识的可信度。

-   As a form of intervening in the world, quantification necessitates its own ecologies of usability and valuation. Trust in numbers is therefore best understood as a variegated "practical accomplishment", emanating from efforts at standardization and mechanization, along with forms of professional and institutional work.

    > 作为一种对世界的干预方式，数量化需要自己的可用性和估值体系。因此，对数字的信任最好理解为一种多样化的"实践成就"，它源自于标准化和机械化的努力，以及各种形式的专业和机构工作。

-   A second line of work central to problems of trust in complex organizational setting is found in pragmatist traditions of social and organizational science. Duwey argures that instead of existing as a *priori* criteria, values --- as perceived or assigned worth of things --- are continuously negotiated within decision-making. Processes of valuation are simultaneously evaluative (how to value?) and declarative (what is valuable?).

    > 在复杂组织中，解决信任问题的第二条路线是基于实用主义社会和组织科学传统的。杜威认为，价值不是预先确定的标准，而是在决策过程中不断协商的。价值评估过程同时是评价性的（如何评价？）和宣告性的（什么是有价值的？）。

-   Data science is not just interested in calculating what *is*, but also "aspires to calculate what is yet to come".

    > 数据科学不仅关心计算现实是什么，还"渴望计算未来可能会发生什么"。

-   In complex organization settings, data science is transected by multiple experts, interests, and goals, relying upon and feeding into a plethora of practices such as business analytics, product design, and project management. Applied data science needs not only scientists and engineers, but also managers and executives.

    > 在复杂的组织环境中，数据科学被多个专家、利益和目标所影响，依赖于和参与到许多实践中，例如业务分析、产品设计和项目管理。应用数据科学不仅需要科学家和工程师，还需要管理者和高管。

-   In this paper, we address two of these mechanisms: *algorithmic witnessing*, in which data scientists assess model performance by variously, most technically, reproducing models and results; and, *deliberative accountability*, in which multiple experts assess systems through collaborative negotiations between diverse forms of trained judgments and performance criteria.

    > 在本文中，我们讨论了其中的两种机制：算法见证，即数据科学家通过各种方式评估模型性能，主要是技术上再现模型和结果；以及责任审议，即多个专家通过协商评估系统，通过专业判断和性能标准之间的协作谈判来达成共识。

## Research Site, Methods, and Findings

-   During fieldwork, we began to encounter discrepancies between how different organizational actors (such as data scientists, project managers, and business analysts) articulated problems with and confidence in data and models.

    > 在田野调查期间，我们开始发现不同组织行动者（如数据科学家、项目经理和业务分析师）在数据和模型问题及信心方面的表达之间存在差异。

### Case 1 \| Churn Prediction

-   There is stuff that you can predict and model, but it just seems unreasonable to a data scientist that you can create a model that perfectly models human behavior. The challenge with non-technical people is they think that computers can do more than they really can.

    > 有些东西你可以预测和建模，但让一个数据科学家觉得不合理的是，你可以创建一个完美地模拟人类行为的模型。挑战在于非技术人员认为计算机可以做更多的事情，但实际上并非如此。

-   Even bad results or less than ideal results can be good --- it is more than what you know now.

    > 即使是糟糕的结果或不理想的结果也可能是好的，因为它比你现在所知道的要多。

-   Certain highly-weighted features matched business intuitions, and everyone in the meeting considered that a good thing. Models that knew "nothing about business" had correctly identified certain aspects integral to business practices. Such forms of intuitive results were important not only for business analysts, but also for data scientists.

    > 某些高权重特征符合业务直觉，与会者都认为这是一件好事。对于不了解业务的模型来说，了解对业务实践至关重要。这种直觉结果不仅对业务分析师重要，对数据科学家也很重要。

### Case 2 \| Special Finding

-   Working solutions to data-driven problems require creative mechanisms and situated discretion to work *with* messiness and *around* messiness.

    > 解决基于数据的问题需要创造性的机制和情境判断来处理混乱以及绕过混乱。

## Discussion

-   During fieldwork, we saw several instances in which numbers considered sub-optimal were broken down into their constituent parts, while numbers assumed adequate or sufficiently high were often communicated and interpreted at face value.

    > 在实地调查期间，我们看到了许多次将被认为不够理想的数字分解为其组成部分的情况，而被认为足够好或足够高的数字通常是以表面意义传达和解释的。

-   Demarcating between algorithmic and human analytical approaches to justify perceived differences. Data Science team argued that, unlike humans, algorithms statistically traverse the uneven contours of data, producing results that may sometimes appear unrecognizable or different. Counter-intuitive finding,they argued, can at times comprise novel forms of knowledge and not model mistakes.

    > 划分算法和人类分析方法以证明感知差异的正当性。数据科学团队认为，与人类不同，算法在统计上穿越数据的不平坦轮廓，产生的结果有时可能看起来不可识别或不同。他们认为，反直觉的发现有时可能包含新形式的知识，而不是模型错误。

-   Data scientists argued for a trade-off between understandability and effectiveness --- state-of-the-art models were not entirely inspectable. As one data scientist said, the complexity of models is not a problem but the very reason why they work --- a resource for model performance instead of a topic for analytic concern. Transparency remained a problematic ideal caught between multiple interpretations of inscrutability. Opacity was often perceived as a function of models' black-boxed nature, necessitating detailed descriptions of algorithmic workings. Even when translucent, models remained recondite --- their workings were complex; their results were hard to explain. Underscoring the import and value of results in these circumstances, deemphasized complex descriptions and absent explanations. The question changed from how or why models worked to whether or how well they worked. "Implicit trust" took the place of complex descriptions. "Explicit verification" from real-world tests supplanted absent explanations.

    > 数据科学家们主张在可理解性和有效性之间进行权衡------最先进的模型并不完全可检查。正如一位数据科学家所说，模型的复杂性不是问题，而是它们有效工作的根本原因------这是提高模型性能的资源，而不是分析关注的主题。透明度始终是一个存在多种解释的棘手理想，陷入多种不透明性解释之间。不透明性常被视为模型黑匣子性质的一种函数，需要详细描述算法工作原理。即使模型变得半透明，其仍然晦涩难解------其工作过程复杂，其结果难以解释。在这种情况下，强调结果的重要性和价值，减弱了复杂的描述和缺乏解释的重要性。问题由模型如何或为何工作变为了它们是否工作或工作得有多好的问题。"隐性信任"取代了复杂的描述。"真实世界测试"的"显性验证"取代了缺失的解释。

-   Rather than a natural or inevitable property of data or algorithms themselves, the perceived trustworthiness of applied data science systems, as we show in this paper, is a collaborative accomplishment, emerging from the situated resolution of specific tensions through pragmatic and ongoing forms of work.

    > 与数据或算法本身的自然或必然属性相反，正如本文所示，应用数据科学系统的感知信任度是一种合作性的成就，通过实用的和持续的工作形式，在特定张力的情境化解中产生。

-   Corporate data science are inherently heterogeneous, comprised by the collaboration of diverse actors and aspirations. Project managers, product designers, and business analysts are as much a part of applied real-world corporate data science as are data scientists --- the operations and relations of trust and credibility between data science and business teams are not *outside* the purview of data science work, but *integral* to its very technival operation.

    > 企业数据科学本质上是异质的，由多样化的行动者和愿景的合作构成。项目经理、产品设计师和业务分析师与数据科学家一样，都是应用于实际世界企业数据科学的一部分------数据科学与业务团队之间的信任和可信度的运作和关系不在数据科学工作的范围之外，而是其技术操作的一个不可或缺的组成部分。

-   Narrativization, as a form of doing, implicates data science between reality and possibility, between signal and noise --- indeed, between life and data.

    > 叙事化作为一种实践形式，将数据科学置于现实与可能性之间、信号与噪音之间------实际上，置于生活与数据之间。

-   The incorporation of collaboration (e.g., interacting with non-data-scientists) and translation (e.g., effective communication of results) work into data science curricula and training is thus a good first step to ensure that would-be data scientists not only learn the skills to negotiate the trust in and credibility of their technical work, but also learn to see such forms of work as integral to the everyday work of data science. Or, to put it in terms of sociologists Harry Collins and Robert Evans, real-world applied data science projects require forms of both "contributory" and "interactional" expertise.

    > 将协作（例如，与非数据科学家互动）和翻译（例如，有效地传达结果）工作纳入数据科学课程和培训是确保未来的数据科学家不仅学习到协商技术工作的信任和可信度的技能，而且学会将这种形式的工作视为数据科学日常工作的不可或缺的部分的良好第一步。换句话说，用社会学家哈里·柯林斯和罗伯特·埃文斯的话来说，实际应用的数据科学项目需要同时具备"贡献性"和"互动性"专业知识形式。

-   With current calls for more open documentation, corporate organizations need to document not only algorithmic functions and data variables, but also data decisions, model choices, and interim results. Organizations need to allocate additional resources and efforts to make visible and archive the seemingly mundane, yet extremely significant, decisions and imperatives in everyday data science work.

    > 随着对更开放文档的呼吁，企业组织需要记录的不仅仅是算法功能和数据变量，还有数据决策、模型选择和中期结果。组织需要投入额外的资源和努力来公开和存档看似平凡但极为重要的日常数据科学工作中的决策和要求。

# 阅读感受

作为[开启论文阅读](../../posts/come-on-paper)后的第一篇文献，这篇论文最先吸引我的是它采用田野调查，而不是目前很流行的实证模型进行论证。另外，在企业的数据部门实习+工作小半年，尝试做了模型产品，让我有经历支撑我去阅读它。

企业中各部门的场景不同，关注内容也不同，因此翻译和协作至关重要，比如业务部门想评估客户的付款意愿度等级，对于数据部门来说可能是预测付款概率的问题。

在模型评审会上，我们会报告模型性能指标，如准确率、召回率等等，不同产品、不同业务关注的模型性能指标不同。我们还会报告模型特征、特征权重等内容，以帮助业务人员判断模型是否与业务逻辑相符。论文中也指出：当业务中的重要指标没有出现在模型中，即反直觉出现时，可能是新的知识出现。

结论部分，作者回到开放科学，认为日常数据科学工作流程的大部分内容都需要文档记录。确实如此，数据分析报告、模型结果一般被认为是最终需要的内容，但是数据分析、建模的过程往往充满各种琐碎的细节和决策的依据，这些内容是数据分析报告和模型不可或缺的一部分，但在最终的结果中往往被遗漏。因此 [RMarkdown](https://rmarkdown.rstudio.com/) 和 [Quarto](https://quarto.org/) 的出现顺应大势，它们让分析建模的过程可选择性地展示出来，提高数据科学过程的透明度，有利于提高可信度。

在未来研究中，作者提到数据科学纳入到企业实践中的方式和立场因组织而异，比如：

1.  数据科学被认为是组织知识的资产，是因为其分析能力，还是因为市场竞争的需要？
2.  如果事情不顺利，数据科学团队成员会承担很大的损失，还是允许他们进行实验并犯错误？
3.  在数据科学项目中，谁有最后决定权------数据科学家、项目经理、业务分析师还是业务执行人员？
4.  数据科学家是否跨越业务垂直领域工作，还是被分配到特定的业务领域？

这不仅是数据科学的问题，也是企业管理的问题，等待俺的后续阅读、观察和思考。
